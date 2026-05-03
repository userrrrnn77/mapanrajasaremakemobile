import { View } from "react-native";
import { Typography } from "./Typography";

interface Step {
  label: string;
  isCompleted: boolean;
  isActive: boolean;
}

export const StatusStep = ({ steps }: { steps: Step[] }) => {
  return (
    <View className="flex-row items-center justify-between px-2 my-4">
      {steps.map((step, index) => (
        <View key={index} className="flex-1 items-center flex-row">
          <View className="items-center">
            <View
              className={`w-6 h-6 rounded-full items-center justify-center ${step.isCompleted ? "bg-primary" : step.isActive ? "border-2 border-primary" : "bg-muted"}`}>
              {step.isCompleted && (
                <View className="w-2 h-2 bg-white rounded-full" />
              )}
            </View>
            <Typography
              variant="caption"
              className="mt-1 text-[10px] absolute -bottom-5 w-20 text-center">
              {step.label}
            </Typography>
          </View>
          {index < steps.length - 1 && (
            <View
              className={`h-[2px] flex-1 mx-2 ${step.isCompleted ? "bg-primary" : "bg-muted"}`}
            />
          )}
        </View>
      ))}
    </View>
  );
};
