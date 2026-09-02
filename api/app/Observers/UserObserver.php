<?php

namespace App\Observers;
use App\Models\User;
use App\Models\Tenant; 
class UserObserver
{
    public function creating(User $user) : void
    {
        if($user->tenant_id)
        {
            return;
        }

        $tenant = Tenant::create([
            'name' => $user->name . ' Tenant'
        ]);

        $user->tenant_id = $tenant->id;

    }
}
