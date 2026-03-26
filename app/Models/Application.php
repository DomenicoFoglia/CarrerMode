<?php

namespace App\Models;


use App\Models\User;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['user_id', 'company', 'role', 'offer_text', 'url', 'source', 'contract_type', 'location', 'salary_range', 'status', 'interest_rating','match_score', 'notes', 'applied_at'])]

class Application extends Model
{
    use HasFactory;
    public function user(){
        return $this->belongsTo(User::class);
    }

    public function attachments(){
        return $this->hasMany(Attachment::class);
    }

    public function reminders(){
        return $this->hasMany(Reminder::class);
    }

    public function tags(){
        return $this->belongsToMany(Tag::class);
    }
}
