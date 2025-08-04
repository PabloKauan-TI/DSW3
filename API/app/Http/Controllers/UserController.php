<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index()
    {
        return response()->json(User::all(), 200);
    }

    public function show($id)
    {
        $user = User::find($id);

        if (!$user)
            return response()->json(['message' => 'Usuário não encontrado'], 404);

        return response()->json($user, 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'  => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'telefone' => 'required|string'
        ]);

        $user = User::create($validated);

        return response()->json($user, 201);
    }

    public function update(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user)
            return response()->json(['message' => 'Usuário não encontrado'], 404);

        $validated = $request->validate([
            'name'  => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,' . $id,
            'telefone' => 'sometimes|required|string'
        ]);

        $user->update($validated);

        return response()->json($user, 200);
    }

    public function destroy($id)
    {
        $user = User::find($id);

        if (!$user)
            return response()->json(['message' => 'Usuário não encontrado'], 404);

        $user->delete();

        return response()->json(['message' => 'Usuário removido com sucesso'], 200);
    }
}