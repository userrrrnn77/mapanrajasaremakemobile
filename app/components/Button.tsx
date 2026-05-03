import {
  TouchableOpacity,
  ActivityIndicator,
  TouchableOpacityProps,
} from "react-native";
import { Typography } from "./Typography";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: "primary" | "outline" | "ghost";
}

export const Button = ({
  title,
  loading,
  variant = "primary",
  ...props
}: ButtonProps) => {
  const containerStyle = {
    primary: "bg-primary",
    outline: "border border-border bg-transparent",
    ghost: "bg-transparent",
  };

  const textStyle = {
    primary: "text-primary-foreground font-bold",
    outline: "text-foreground",
    ghost: "text-primary",
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={loading || props.disabled}
      className={`p-4 rounded-xl flex-row justify-center items-center ${containerStyle[variant]} ${props.className} ${props.disabled ? "opacity-50" : ""}`}
      {...props}>
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Typography
          className={`${textStyle[variant]} text-center text-white text-xl`}>
          {title}
        </Typography>
      )}
    </TouchableOpacity>
  );
};
