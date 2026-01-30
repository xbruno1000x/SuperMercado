<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'nome' => 'João Silva',
            'email' => 'joao@teste.com',
            'password' => 'senha123',
            'password_confirmation' => 'senha123',
            'cpf' => '12345678901',
            'telefone' => '11999999999',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'user' => ['id', 'nome', 'email', 'perfil'],
                'token',
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'joao@teste.com',
            'perfil' => 'cliente',
        ]);
    }

    public function test_user_can_login(): void
    {
        $user = User::factory()->create([
            'email' => 'teste@teste.com',
            'password' => bcrypt('senha123'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'teste@teste.com',
            'password' => 'senha123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'user' => ['id', 'nome', 'email'],
                'token',
            ]);
    }

    public function test_login_fails_with_invalid_credentials(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'invalido@teste.com',
            'password' => 'senhaerrada',
        ]);

        $response->assertStatus(401)
            ->assertJson(['message' => 'Credenciais inválidas']);
    }

    public function test_user_can_get_profile(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/auth/me');

        $response->assertStatus(200)
            ->assertJson([
                'id' => $user->id,
                'email' => $user->email,
            ]);
    }

    public function test_user_can_logout(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/auth/logout');

        $response->assertStatus(200);
    }

    public function test_inactive_user_cannot_login(): void
    {
        User::factory()->create([
            'email' => 'inativo@teste.com',
            'password' => bcrypt('senha123'),
            'ativo' => false,
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'inativo@teste.com',
            'password' => 'senha123',
        ]);

        $response->assertStatus(403);
    }
}
