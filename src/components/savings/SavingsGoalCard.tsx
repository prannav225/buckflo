import { Calendar } from 'lucide-react';
import { type SavingGoal } from '../../db/database';
import { formatINR } from '../../utils/currency';
import { formatDate } from '../../utils/dateUtils';

interface Props {
  goal: SavingGoal;
  onClick: () => void;
}

export function SavingsGoalCard({ goal, onClick }: Props) {
  const percent = Math.min(
    100,
    Math.max(
      0,
      goal.targetAmount > 0 ? (goal.currentAllocated / goal.targetAmount) * 100 : 0
    )
  );
  const isCompleted = percent >= 100;

  // SVG Progress ring math
  const radius = 24;
  const stroke = 3;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div
      className={`goal-card ${isCompleted ? "goal-card-completed" : ""}`}
      onClick={onClick}
    >
      <div className="progress-ring-wrapper">
        <svg width="60" height="60" viewBox="0 0 60 60">
          {/* Background circle */}
          <circle
            stroke="var(--border)"
            fill="transparent"
            strokeWidth={stroke}
            r={radius}
            cx="30"
            cy="30"
          />
          {/* Foreground progress circle */}
          <circle
            className="progress-ring-circle"
            stroke={isCompleted ? "var(--credit)" : "var(--accent)"}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset }}
            r={radius}
            cx="30"
            cy="30"
          />
        </svg>
        <span
          className="progress-ring-percent"
          style={{ fontSize: "0.6875rem" }}
        >
          {Math.round(percent)}%
        </span>
      </div>
      <div className="goal-name">{goal.name}</div>
      <div className="goal-amount">{formatINR(goal.currentAllocated)}</div>
      <div
        style={{
          fontSize: "0.6875rem",
          color: "var(--text-muted)",
          marginTop: 2,
        }}
      >
        of {formatINR(goal.targetAmount)}
      </div>
      {goal.deadline && (
        <div className="goal-deadline" style={{ marginTop: 6 }}>
          <Calendar size={10} />
          <span>{formatDate(goal.deadline)}</span>
        </div>
      )}
    </div>
  );
}
