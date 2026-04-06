<?php

namespace App\Notifications;

use App\Models\Reminder;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ReminderNotification extends Notification
{
    use Queueable;

    public function __construct(public Reminder $reminder) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $application = $this->reminder->application;

        return (new MailMessage)
            ->subject("CareerMode — Reminder: {$this->reminder->title}")
            ->greeting("Ciao {$notifiable->name}!")
            ->line("Hai un reminder per la candidatura a **{$application->role}** presso **{$application->company}**.")
            ->line("**{$this->reminder->title}**")
            ->when($this->reminder->notes, fn($mail) =>
                $mail->line("Note: {$this->reminder->notes}")
            )
            ->line("Scadenza: " . \Carbon\Carbon::parse($this->reminder->remind_at)->format('d/m/Y H:i'))
            ->action('Apri CareerMode', 'http://localhost:5173')
            ->line('Buona fortuna con la tua ricerca lavoro!');
    }
}