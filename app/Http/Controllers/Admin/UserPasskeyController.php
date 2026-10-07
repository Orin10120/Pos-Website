<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Laravel\Passkeys\Actions\DeletePasskey;
use Laravel\Passkeys\Actions\GenerateRegistrationOptions;
use Laravel\Passkeys\Actions\StorePasskey;
use Laravel\Passkeys\Http\Requests\PasskeyRegistrationRequest;
use Laravel\Passkeys\Passkey;
use Laravel\Passkeys\Support\WebAuthn;

/**
 * Admin mendaftarkan Face ID / passkey untuk user lain.
 *
 * Biometrik tidak pernah dikirim ke server. Perangkat yang sedang dipakai
 * hanya membuat credential (public key) yang terikat ke akun user tersebut,
 * jadi orang yang wajahnya terdaftar di perangkat itulah yang nanti bisa login.
 */
class UserPasskeyController extends Controller
{
    public function options(Request $request, User $user, GenerateRegistrationOptions $generate): JsonResponse
    {
        $options = $generate($user);

        $request->session()->put('passkey.registration_options', WebAuthn::toJson($options));

        return response()->json([
            'options' => WebAuthn::toBrowserArray($options),
        ]);
    }

    public function store(PasskeyRegistrationRequest $request, User $user, StorePasskey $storePasskey): JsonResponse
    {
        $passkey = $storePasskey(
            $user,
            $request->string('name')->toString(),
            $request->credential(),
            $request->registrationOptions(),
        );

        return response()->json([
            'status' => 'passkey-registered',
            'passkey' => $this->present($passkey),
        ]);
    }

    public function destroy(User $user, Passkey $passkey, DeletePasskey $deletePasskey): JsonResponse
    {
        abort_unless((string) $passkey->user_id === (string) $user->getKey(), 404);

        $deletePasskey($user, $passkey);

        return response()->json(['status' => 'passkey-deleted']);
    }

    public static function present(Passkey $passkey): array
    {
        return [
            'id' => $passkey->id,
            'name' => $passkey->name,
            'last_used_at' => $passkey->last_used_at?->toIso8601String(),
            'created_at' => $passkey->created_at?->toIso8601String(),
        ];
    }
}
