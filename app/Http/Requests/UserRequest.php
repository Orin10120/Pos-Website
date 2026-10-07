<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $userId = $this->route('user') ? $this->route('user')->id : null;

        $rules = [
            'name'  => 'required',
            'email' => [
            'required',
            'string',
            'email',
            'max:255',
            Rule::unique('users', 'email')->ignore($userId),
            ],
            'enroll_face'  => 'nullable|boolean',
            'warehouse_id' => 'nullable|exists:warehouses,id',
            'store_id'     => 'required|exists:stores,id',
        ];

        if ($this->isMethod('POST')) {
            $rules['password'] = 'required|confirmed';
        } else {
            $rules['password'] = 'nullable|confirmed';
        }

        return $rules; // Mengembalikan aturan validasi
    }
}
