<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;

use Inertia\Inertia;

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

    public function faceLogin(Request $request) {
        $request->validate([
            'email' => 'required|email',
            'face_image'  => 'required|array|128',
        ]);

        $user = User::where('email', $request->email)->first();

        // Decode data descriptor yang disimpan saat registrasi
        $storedDescriptor = is_string($user->face_embeddings)
                    ? json_decode($user->face_embeddings, true)
                    : $user->face_embeddings;

        if (!$user || empty($storedDescriptor)) {
            throw ValidationException::withMessages([
                'email' => 'No registered face data found for this email.',
            ]);
        }

        // 2. Bandingkan Vektor Wajah Menggunakan Euclidean Distance
        if (!$this->compareFaceDescriptors($storedDescriptor, $request->face_descriptor)) {
            throw ValidationException::withMessages([
                        'face_descriptor' => 'Face does not match registered data.',
                    ]);
                }

        // 3. Login sukses
        Auth::login($user);
        $request->session()->regenerate();

        return response()->json([
            'message'  => 'Login successful.',
            'redirect' => route('admin.dashboard'),
        ]);
    }


    private function compareFaceDescriptors(array $stored, array $current): bool
    {
        if (count($stored) !== count($current)) {
            return false;
        }

        $sum = 0.0;
        for ($i = 0; $i < count($stored); $i++) {
            $diff = $stored[$i] - $current[$i];
            $sum += $diff * $diff;
        }

        $distance = sqrt($sum);

        // Standard Threshold untuk face-api.js biasanya <= 0.6
        // Angka < 0.6 dianggap orang yang sama. Semakin kecil angkanya, semakin identik.
        $threshold = 0.6;

        return $distance <= $threshold;
    }
}
