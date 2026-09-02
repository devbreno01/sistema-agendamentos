<?php

namespace App\Http\Controllers\Api;

use App\DTO\AppointmentDto;
use App\Http\Controllers\Controller;
use App\Http\Requests\AppointmentRequest;
use App\Http\Requests\AppointmentStatusRequest;
use App\Services\AppointmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class AppointmentController extends Controller
{
    public function __construct(
        private readonly AppointmentService $service,
    ) {}

    public function index(): JsonResponse
    {
        return response()->json(['data' => $this->service->getAll()]);
    }

    public function store(AppointmentRequest $request): JsonResponse
    {
        $appointment = $this->service->create(AppointmentDto::fromRequest($request));

        return response()->json([
            'message' => 'Consulta agendada com sucesso.',
            'data' => $appointment,
        ], 201);
    }

    public function show(int $appointment): JsonResponse
    {
        return response()->json(['data' => $this->service->find($appointment)]);
    }

    public function update(AppointmentRequest $request, int $appointment): JsonResponse
    {
        $updatedAppointment = $this->service->update(
            $appointment,
            AppointmentDto::fromRequest($request),
        );

        return response()->json([
            'message' => 'Consulta atualizada com sucesso.',
            'data' => $updatedAppointment,
        ]);
    }

    public function updateStatus(AppointmentStatusRequest $request, int $appointment): JsonResponse
    {
        $updatedAppointment = $this->service->changeStatus(
            $appointment,
            $request->validated('status'),
        );

        return response()->json([
            'message' => 'Status da consulta atualizado com sucesso.',
            'data' => $updatedAppointment,
        ]);
    }

    public function destroy(int $appointment): Response
    {
        $this->service->delete($appointment);

        return response()->noContent();
    }
}
