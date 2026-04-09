<?php

namespace App\Http\Controllers;

use App\Models\Application;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ApplicationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        //Recuperiamo l'utente
        $user = \App\Models\User::find(Auth::id());
        //Recuperiamo le candidature e carichiamo anche i tag
        $query = $user->applications()->with('tags')->latest();

        //Filtro per stato
        if($request->filled('status')){
            $query->where('status', $request->status);
        }

        //Filtro per ricerca testuale
        if($request->filled('search')){
            $query->where(function($q) use ($request){
                $q->where('company', 'like', '%' . $request->search . '%')
                ->orWhere('role', 'like', '%' . $request->search . '%');
            });
        }

        // Filtro per tag
        if ($request->filled('tags')) {
            $tagIds = explode(',', $request->tags);
            $tagMode = $request->input('tag_mode', 'OR');

            if ($tagMode === 'AND') {
                foreach ($tagIds as $tagId) {
                    $query->whereHas('tags', fn($q) => $q->where('tags.id', $tagId));
                }
            } else {
                $query->whereHas('tags', fn($q) => $q->whereIn('tags.id', $tagIds));
            }
        }

        $perPage = $request->input('per_page', 15);
        $applications = $query->paginate($perPage);

        return response()->json($applications);
    }

    // Pulisce gli URL 
    private function cleanUrl(?string $url): ?string
    {
        if (!$url) return null;
        $parsed = parse_url($url);
        if (!$parsed) return $url;
        return ($parsed['scheme'] ?? 'https') . '://' . ($parsed['host'] ?? '') . ($parsed['path'] ?? '');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'company' => 'required|string|max:255',
            'role' => 'required|string|max:255',
            'offer_text' => 'nullable|string',
            'url' => 'nullable|url|max:2000',
            'source' => 'nullable|string|max:100',
            'contract_type' => 'nullable|string|max:100',
            'location' => 'nullable|string|max:255',
            'salary_range' => 'nullable|string|max:100',
            'status' => 'required|in:sent,interview,waiting,rejected,draft',
            'interest_rating' => 'nullable|integer|min:1|max:5',
            'match_score' => 'nullable|integer|min:0|max:100',
            'notes' => 'nullable|string',
            'applied_at' => 'required|date',
            'tags' => 'nullable|array',
            'tags.*' => 'integer|exists:tags,id,user_id,' . Auth::id()
        ]);

        $validated['url'] = $this->cleanUrl($validated['url'] ?? null);

        $user = \App\Models\User::find(Auth::id());

        $application = $user->applications()->create(
            collect($validated)->except('tags')->toArray()
        );

        // Se sono stati inviati dei tag, li colleghiamo nella tabella pivot
        if ($request->has('tags')) {
            $application->tags()->sync($validated['tags']);
        }

        return response()->json([
            'message' => 'Candidatura salvata con successo',
            'application' => $application->load('tags')
        ], 201); //201 -> creato
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $user = \App\Models\User::find(Auth::id());

        //Cerca la candidatura tra quelle dell'utente, se la trova la ritorna altrimenti, con 
        //la funzione findOrFail(), ritorna direttamente 404
        $application = $user->applications()->with(['reminders', 'tags'])->findOrFail($id);

        return response()->json([
            'message' => 'Candidatura trovata',
            'application' => $application
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $user = \App\Models\User::find(Auth::id());

        $application = $user->applications()->findOrFail($id);

        $validated = $request->validate([
            'company' => 'sometimes|required|string|max:255',
            'role' => 'sometimes|required|string|max:255',
            'offer_text' => 'nullable|string',
            'url' => 'nullable|url|max:2000',
            'source' => 'nullable|string|max:100',
            'contract_type' => 'nullable|string|max:100',
            'location' => 'nullable|string|max:255',
            'salary_range' => 'nullable|string|max:100',
            'status' => 'sometimes|required|in:sent,interview,waiting,rejected,draft',
            'interest_rating' => 'nullable|integer|min:1|max:5',
            'match_score' => 'nullable|integer|min:0|max:100',
            'notes' => 'nullable|string',
            'applied_at' => 'sometimes|required|date',
            'tags' => 'nullable|array',
            'tags.*' => 'integer|exists:tags,id,user_id,' . Auth::id()
        ]);

        $validated['url'] = $this->cleanUrl($validated['url'] ?? null);

        //Aggiorniamo
        $application->update(collect($validated)->except('tags')->toArray());

        //Sincronizziamo i tag. Usiamo un ternario perche' e' possibile che l'utente non inserisca i tag
        if ($request->has('tags')) {
            $application->tags()->sync($validated['tags'] ?? []);
        }

        return response()->json([
            'message' => 'Candidatura aggiornata con successo',
            'application' => $application->load('tags')
        ]);

    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = \App\Models\User::find(Auth::id());

        $application = $user->applications()->findOrFail($id);

        $application->delete();

        return response()->json([
            'message' => 'Candidatura eliminata con successo'
        ], 200);
    }

    public function stats()
    {
        $user = \App\Models\User::find(Auth::id());

        // 1. Otteniamo i conteggi per stato in un'unica query
        $statusCounts = $user->applications()
            ->selectRaw("status, count(*) as total")
            ->groupBy('status')
            ->pluck('total', 'status');

        // 2. Query per l'andamento mensile
        $monthlyStats = $user->applications()
            ->selectRaw('MONTH(applied_at) as month, COUNT(*) as count')
            ->whereYear('applied_at', date('Y'))
            ->groupBy('month')
            ->orderBy('month')
            ->get();
        
        // 3. Candidature questo mese
        $thisMonth = $user->applications()
            ->whereMonth('applied_at', date('m'))
            ->whereYear('applied_at', date('Y'))
            ->count();

        // 4. Reminder in scadenza nei prossimi 7 giorni
        $expiringReminders = \App\Models\Reminder::whereHas('application', function($q) {
            $q->where('user_id', Auth::id());
        })
        ->where('sent', false)
        ->where('remind_at', '<=', now()->addDays(7))
        ->count();

        // 5. Tag più usati
        $topTags = DB::table('application_tag')
            ->join('tags', 'application_tag.tag_id', '=', 'tags.id')
            ->join('applications', 'application_tag.application_id', '=', 'applications.id')
            ->where('applications.user_id', Auth::id())
            ->select('tags.name', 'tags.color', \DB::raw('COUNT(*) as count'))
            ->groupBy('tags.id', 'tags.name', 'tags.color')
            ->orderByDesc('count')
            ->limit(8)
            ->get();

        
        // 6. Distribuzione per tipo di contratto
        $contractTypes = $user->applications()
            ->whereNotNull('contract_type')
            ->where('contract_type', '!=', '')
            ->selectRaw('contract_type, COUNT(*) as count')
            ->groupBy('contract_type')
            ->orderByDesc('count')
            ->get()
            ->map(fn($item) => [
                'name'  => $item->contract_type,
                'count' => $item->count
            ]);

        $months = [
            1 => 'Gen', 2 => 'Feb', 3 => 'Mar', 4 => 'Apr', 5 => 'Mag', 6 => 'Giu',
            7 => 'Lug', 8 => 'Ago', 9 => 'Set', 10 => 'Ott', 11 => 'Nov', 12 => 'Dic'
        ];

        $stats = [
            'total'     => $statusCounts->sum(),
            'sent'      => $statusCounts->get('sent', 0),
            'interview' => $statusCounts->get('interview', 0),
            'waiting'   => $statusCounts->get('waiting', 0),
            'rejected'  => $statusCounts->get('rejected', 0),
            'by_month'  => $monthlyStats->map(fn($item) => [
                'name'  => $months[$item->month],
                'count' => $item->count
            ]),
            'this_month' => $thisMonth,
            'expiring_reminders' => $expiringReminders,
            'top_tags'           => $topTags,
            'contract_types' => $contractTypes,
        ];

        return response()->json($stats);
    }

    

}
