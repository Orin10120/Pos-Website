<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class LoginController extends Controller
{
    public function index() {
        return Inertia('Login');
    }


    public function store(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $credentials = $request->only('email', 'password');

        if (auth()->attempt($credentials)) {
            $request->session()->regenerate();
            return redirect()->route('admin.dashboard');
        }

        return back()->withErrors([
            'email' => 'The credentials provided do not match our records.',
        ]);
    }

    // Login dengan Face ID / passkey ditangani oleh package laravel/passkeys:
    //   GET  /passkeys/login/options
    //   POST /passkeys/login
}
