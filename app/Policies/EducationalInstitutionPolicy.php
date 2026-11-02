<?php

namespace App\Policies;

use App\Models\EducationalInstitution;
use App\Models\User;

class EducationalInstitutionPolicy
{
    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'super_admin'], true);
    }

    public function update(User $user, EducationalInstitution $institution): bool
    {
        return $this->create($user);
    }

    public function delete(User $user, EducationalInstitution $institution): bool
    {
        return $this->create($user);
    }
}
