<?php

namespace Tests\Feature;

use App\Models\City;
use App\Models\Province;
use App\Models\Store;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Illuminate\Testing\TestResponse;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class NotificationHandlerTest extends TestCase
{
    use RefreshDatabase;

    private const string CALLBACK_TOKEN = 'xendit-test-callback-token';

    protected function setUp(): void
    {
        parent::setUp();

        config(['services.xendit.token_webhook' => self::CALLBACK_TOKEN]);
    }

    public static function xenditStatusProvider(): array
    {
        return [
            'PAID menjadi success' => ['PAID', 'success'],
            'SETTLED menjadi success' => ['SETTLED', 'success'],
            'PENDING menjadi pending' => ['PENDING', 'pending'],
            'EXPIRED menjadi expired' => ['EXPIRED', 'expired'],
            'FAILED menjadi failed' => ['FAILED', 'failed'],
        ];
    }

    #[DataProvider('xenditStatusProvider')]
    public function test_maps_xendit_status_to_transaction_status(string $xenditStatus, string $expectedStatus): void
    {
        $transaction = $this->createPendingOnlineTransaction();

        $response = $this->postNotification([
            'external_id' => $transaction->invoice,
            'status' => $xenditStatus,
            'amount' => 100000,
            'paid_amount' => 100000,
        ]);

        $response->assertOk();

        $transaction->refresh();
        $this->assertSame($expectedStatus, $transaction->status);
        $this->assertSame('online', $transaction->payment_method);
    }

    public function test_returns_403_when_callback_token_is_invalid(): void
    {
        $transaction = $this->createPendingOnlineTransaction();

        $response = $this->postNotification([
            'external_id' => $transaction->invoice,
            'status' => 'PAID',
            'amount' => 100000,
            'paid_amount' => 100000,
        ], 'token-salah');

        $response->assertForbidden();
        $this->assertSame('pending', $transaction->refresh()->status);
    }

    public function test_marks_transaction_as_success_from_event_payload(): void
    {
        $transaction = $this->createPendingOnlineTransaction();

        $response = $this->postNotification([
            'event' => 'invoice.paid',
            'data' => [
                'external_id' => $transaction->invoice,
                'status' => 'PAID',
                'amount' => 100000,
                'paid_amount' => 100000,
            ],
        ]);

        $response->assertOk();
        $this->assertSame('success', $transaction->refresh()->status);
    }

    public function test_returns_422_and_keeps_transaction_pending_when_paid_amount_is_lower(): void
    {
        $transaction = $this->createPendingOnlineTransaction(totalAmount: 100000, discount: 10000);

        $response = $this->postNotification([
            'external_id' => $transaction->invoice,
            'status' => 'PAID',
            'amount' => 90000,
            'paid_amount' => 50000,
        ]);

        $response->assertUnprocessable();
        $this->assertSame('pending', $transaction->refresh()->status);
    }

    public function test_does_not_downgrade_success_transaction_on_late_pending_notification(): void
    {
        $transaction = $this->createPendingOnlineTransaction(status: 'success');

        $response = $this->postNotification([
            'external_id' => $transaction->invoice,
            'status' => 'PENDING',
        ]);

        $response->assertOk();
        $this->assertSame('success', $transaction->refresh()->status);
    }

    public function test_returns_200_and_keeps_status_when_xendit_status_is_unknown(): void
    {
        $transaction = $this->createPendingOnlineTransaction();

        $response = $this->postNotification([
            'external_id' => $transaction->invoice,
            'status' => 'SOMETHING_ELSE',
        ]);

        $response->assertOk();
        $this->assertSame('pending', $transaction->refresh()->status);
    }

    public function test_returns_200_when_external_id_is_missing(): void
    {
        $transaction = $this->createPendingOnlineTransaction();

        $response = $this->postNotification([
            'status' => 'PAID',
        ]);

        $response->assertOk();
        $this->assertSame('pending', $transaction->refresh()->status);
    }

    public function test_returns_200_when_external_id_is_unknown(): void
    {
        $response = $this->postNotification([
            'external_id' => 'INV-TIDAK-ADA',
            'status' => 'PAID',
            'amount' => 100000,
            'paid_amount' => 100000,
        ]);

        $response->assertOk();
    }

    private function postNotification(array $payload, string $token = self::CALLBACK_TOKEN): TestResponse
    {
        return $this->postJson('/api/xendit/notification', $payload, [
            'x-callback-token' => $token,
        ]);
    }

    private function createPendingOnlineTransaction(
        int $totalAmount = 100000,
        int $discount = 0,
        string $status = 'pending',
    ): Transaction {
        $province = Province::create([
            'uuid' => (string) Str::uuid(),
            'external_id' => 1,
            'name' => 'Jawa Barat',
        ]);

        $city = City::create([
            'uuid' => (string) Str::uuid(),
            'external_id' => 1,
            'name' => 'Bandung',
            'province_id' => $province->id,
        ]);

        $store = Store::create([
            'name' => 'Toko Utama',
            'address' => 'Jl. Test No. 1',
            'province_id' => $province->id,
            'city_id' => $city->id,
        ]);

        $user = User::factory()->create(['store_id' => $store->id]);

        return Transaction::create([
            'user_id' => $user->id,
            'store_id' => $store->id,
            'total_amount' => $totalAmount,
            'discount' => $discount,
            'payment_method' => 'online',
            'status' => $status,
        ]);
    }
}
