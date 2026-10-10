from fastapi import APIRouter, Depends
from app.schemas.simulator import SimulationRequest, SimulationResponse, ApplySimulationRequest
from app.services.simulator_service import SimulatorService
from app.core.dependencies import require_roles

router = APIRouter(prefix="/api/simulator", tags=["Live Club Simulator"])

@router.post("/simulate", response_model=SimulationResponse)
def run_simulation(
    data: SimulationRequest,
    current_user: dict = Depends(require_roles(["organizer", "treasurer", "admin"]))
):
    return SimulatorService.simulate(data)

@router.post("/apply")
def apply_simulation_scenario(
    data: ApplySimulationRequest,
    current_user: dict = Depends(require_roles(["organizer", "admin"]))
):
    return SimulatorService.apply_simulation(data, current_user=current_user)
