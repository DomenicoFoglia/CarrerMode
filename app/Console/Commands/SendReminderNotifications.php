<?php

namespace App\Console\Commands;

use App\Models\Reminder;
use App\Notifications\ReminderNotification;
use Illuminate\Console\Command;

class SendReminderNotifications extends Command
{
    protected $signature   = 'reminders:send';
    protected $description = 'Invia le notifiche email per i reminder in scadenza';

    public function handle()
    {
        $reminders = Reminder::where('sent', false)
            ->where('remind_at', '<=', now())
            ->with('application.user')
            ->get();

        if ($reminders->isEmpty()) {
            $this->info('Nessun reminder da inviare.');
            return;
        }

        foreach ($reminders as $reminder) {
            $user = $reminder->application->user;

            $user->notify(new ReminderNotification($reminder));

            $reminder->update(['sent' => true]);

            $this->info("Notifica inviata a {$user->email} per: {$reminder->title}");
        }

        $this->info("Completato: {$reminders->count()} notifiche inviate.");
        sleep(1);
    }
}