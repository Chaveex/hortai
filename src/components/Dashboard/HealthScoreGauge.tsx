import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';

interface HealthScoreGaugeProps {
  score: number; // 0-100
  label?: string;
  size?: number;
  showPercentage?: boolean;
}

export function HealthScoreGauge({
  score,
  label = 'Santé',
  size = 120,
  showPercentage = true,
}: HealthScoreGaugeProps) {
  // Clamp score between 0 and 100
  const clampedScore = Math.max(0, Math.min(100, score));

  // Determine color based on score
  let scoreColor = colors.success;
  if (clampedScore < 50) {
    scoreColor = colors.error;
  } else if (clampedScore < 75) {
    scoreColor = colors.warning;
  }

  const radius = size / 2;
  const strokeWidth = 8;
  const innerRadius = radius - strokeWidth / 2;

  // Background circle circumference
  const circumference = 2 * Math.PI * innerRadius;
  // Arc from 45° to 315° (270° total, leaving gaps at top)
  const arcLength = (clampedScore / 100) * circumference * 0.75;

  // Generate description text
  let description = '';
  if (clampedScore >= 80) {
    description = 'Excellent';
  } else if (clampedScore >= 60) {
    description = 'Bon';
  } else if (clampedScore >= 40) {
    description = 'Moyen';
  } else {
    description = 'Faible';
  }

  return (
    <View style={[styles.container]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.gaugeContainer}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background arc */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={innerRadius}
            fill="none"
            stroke={colors.border}
            strokeWidth={strokeWidth}
            opacity="0.3"
          />

          {/* Score arc */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={innerRadius}
            fill="none"
            stroke={scoreColor}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={circumference * 0.125} // Offset to start at 45°
            strokeLinecap="round"
            opacity="0.9"
          />

          {/* Center circle (white background) */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={innerRadius - strokeWidth - 4}
            fill={colors.surface}
          />

          {/* Score text */}
          <SvgText
            x={size / 2}
            y={size / 2 - 8}
            textAnchor="middle"
            fontSize={(size / 3).toString()}
            fontWeight="700"
            fill={scoreColor}
          >
            {clampedScore.toFixed(0)}
          </SvgText>

          {/* Percentage symbol */}
          {showPercentage && (
            <SvgText
              x={size / 2 + size / 6}
              y={size / 2 - 12}
              textAnchor="middle"
              fontSize={(size / 6).toString()}
              fontWeight="600"
              fill={scoreColor}
            >
              %
            </SvgText>
          )}

          {/* Description */}
          <SvgText
            x={size / 2}
            y={size / 2 + size / 5}
            textAnchor="middle"
            fontSize={(size / 8).toString()}
            fontWeight="500"
            fill={colors.textSecondary}
          >
            {description}
          </SvgText>
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginVertical: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  gaugeContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
