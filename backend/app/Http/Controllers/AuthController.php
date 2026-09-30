<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create($request->validated()); // password tự được băm (cast 'hashed')

        return response()->json([
            'user' => $this->userData($user),
            'token' => $user->createToken('web')->plainTextToken,
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages(['email' => ['Email hoặc mật khẩu không đúng.']]);
        }

        return response()->json([
            'user' => $this->userData($user),
            'token' => $user->createToken('web')->plainTextToken,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Đã đăng xuất.']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json($this->userData($request->user()));
    }

    private function userData(User $u): array
    {
        return ['id' => $u->id, 'name' => $u->name, 'email' => $u->email, 'avatar_url' => $u->avatar_url];
    }
}
