<?php
namespace App\Services;

use App\DTO\UserDto;
use App\Repositories\UserRepository;

class UserService {

    private static function repository(){
        return new UserRepository;
    }

    public function getAll(){
         return self::repository()->all();
        
    }

    public function create(UserDto $dto){

        $user = self::repository()->create([
            "name" => $dto->name,
            "email" => $dto->email,
            "password" => $dto->password
        ]);
        return response()->json(["message" => "Usuário criado com sucesso",
                                "data" => $user]);
    }

}
