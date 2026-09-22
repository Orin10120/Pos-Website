<?php

return [
    'api_key' => env('RAJAONGKIR_API_DELIVER_KEY', ''),
    'origin_city_id' => env('RAJAONGKIR_ORIGIN_CITY_ID', '501'),
    'endpoints' => [
        'province' => 'https://rajaongkir.komerce.id/api/v1/destination/province',
        'city' => 'https://rajaongkir.komerce.id/api/v1/destination/city',
    ],
];
