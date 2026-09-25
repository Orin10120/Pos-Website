<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

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
            'email' => 'required|email|unique:users,email,' . $userId,
            'face_image' => 'nullable|image|mimes:jpeg,png,jpg|max:10240',
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
