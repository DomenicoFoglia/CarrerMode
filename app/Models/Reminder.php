<?php

namespace App\Models;

use App\Models\Application;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['application_id', 'title', 'notes', 'remind_at', 'sent'])]

class Reminder extends Model
{
    public function application(){
        return $this->belongsTo(Application::class);
    }
}
