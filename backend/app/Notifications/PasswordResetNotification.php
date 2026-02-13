<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
// use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PasswordResetNotification extends Notification

    // class PasswordResetNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        protected string $token,
        protected string $resetUrl,
        protected string $userType = 'user'
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $identifier = $this->userType === 'staff'
            ? $notifiable->service_no
            : $notifiable->email;

        $url = "{$this->resetUrl}?token={$this->token}&".($this->userType === 'staff' ? "service_no={$identifier}" : "email={$identifier}");

        $typeLabel = $this->userType === 'staff' ? 'Staff' : 'User';
        $name = $notifiable->name ?? $notifiable->first_name ?? $typeLabel;

        return (new MailMessage)
            ->subject('Reset Your Password')
            ->greeting("Hello, {$name}!")
            ->line('You are receiving this email because we received a password reset request for your account.')
            ->action('Reset Password', $url)
            ->line('This password reset link will expire in 60 minutes.')
            ->line('If you did not request a password reset, no further action is required.');
    }

    public function toArray(object $notifiable): array
    {
        return [];
    }
}
