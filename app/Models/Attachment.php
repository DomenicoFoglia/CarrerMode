<?php

namespace App\Models;

use App\Models\Application;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['application_id', 'type', 'filename', 'path', 'size'])]

class Attachment extends Model
{
    public function application(){
        return $this->belongsTo(Application::class);
    }
}
