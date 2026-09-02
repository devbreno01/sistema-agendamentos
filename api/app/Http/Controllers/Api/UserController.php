<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\DTO\UserDto;
use App\Http\Requests\UserRequest;
use App\Services\UserService;

class UserController extends Controller
{
    private $userService;

    public function __construct(UserService $service)
    {
       $this->userService = $service;
    }

    public function store(UserRequest $request)
    {
        $dto = UserDto::fromRequest($request);

        return $this->userService->create($dto);
    }
}
