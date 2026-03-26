<?php

namespace App\Models;

use App\Models\Application;
use App\Models\User;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['user_id', 'name', 'color'])]

class Tag extends Model
{
    public function user(){
        return $this->belongsTo(User::class);
    }

    public function application(){
        return $this->belongsToMany(Application::class);
    }
}
