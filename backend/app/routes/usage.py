from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from datetime import datetime, timedelta
from ..database import get_db
from ..models import OpenAIUsage

router = APIRouter()


@router.get("/summary")
async def get_usage_summary(db: Session = Depends(get_db)):
    """Get overall usage statistics."""

    total_cost = db.query(func.sum(OpenAIUsage.cost_usd)).scalar() or 0.0
    total_tokens = db.query(func.sum(OpenAIUsage.total_tokens)).scalar() or 0

    recipe_count = db.query(func.count(OpenAIUsage.id)).filter(
        OpenAIUsage.request_type == "recipe_generation"
    ).scalar() or 0

    image_count = db.query(func.count(OpenAIUsage.id)).filter(
        OpenAIUsage.request_type == "image_generation"
    ).scalar() or 0

    return {
        "total_cost_usd": round(total_cost, 4),
        "total_tokens": total_tokens,
        "recipes_generated": recipe_count,
        "images_generated": image_count
    }


@router.get("/history")
async def get_usage_history(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    limit: int = Query(default=50, le=200),
    db: Session = Depends(get_db)
):
    """Get detailed usage history."""

    query = db.query(OpenAIUsage)

    if start_date:
        try:
            start = datetime.fromisoformat(start_date)
            query = query.filter(OpenAIUsage.created_at >= start)
        except ValueError:
            pass

    if end_date:
        try:
            end = datetime.fromisoformat(end_date)
            query = query.filter(OpenAIUsage.created_at <= end)
        except ValueError:
            pass

    usage_records = query.order_by(OpenAIUsage.created_at.desc()).limit(limit).all()

    return {
        "records": [record.to_dict() for record in usage_records],
        "count": len(usage_records)
    }


@router.get("/quota")
async def get_quota_status(db: Session = Depends(get_db)):
    """Get current usage vs budget limits."""

    from ..config import settings

    budget_limit = float(getattr(settings, 'openai_budget_limit', 50.0))

    current_cost = db.query(func.sum(OpenAIUsage.cost_usd)).scalar() or 0.0

    percentage_used = (current_cost / budget_limit * 100) if budget_limit > 0 else 0

    return {
        "current_cost_usd": round(current_cost, 4),
        "budget_limit_usd": budget_limit,
        "percentage_used": round(percentage_used, 2),
        "remaining_usd": round(budget_limit - current_cost, 4)
    }
