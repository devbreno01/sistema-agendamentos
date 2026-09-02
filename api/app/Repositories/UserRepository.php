<?php

namespace App\Repositories;

use App\Repositories\AbstractRepository;
Use App\Models\User;
class UserRepository extends AbstractRepository{
   protected  static $model = User::class;

    

}
