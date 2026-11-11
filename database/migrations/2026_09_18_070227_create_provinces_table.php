<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // gen_random_uuid() hanya tersedia di PostgreSQL.
        // SQLite (dipakai oleh environment test) memerlukan ekspresi default
        // lain yang dibungkus tanda kurung.
        $uuidDefault = DB::connection()->getDriverName() === 'sqlite'
            ? '(lower(hex(randomblob(16))))'
            : 'gen_random_uuid()';

        Schema::create('provinces', function (Blueprint $table) use ($uuidDefault) {
            $table->id();
            $table->uuid('uuid')->default(DB::raw($uuidDefault));
            $table->unsignedBigInteger('external_id');
            $table->string('name');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('provinces');
    }
};
