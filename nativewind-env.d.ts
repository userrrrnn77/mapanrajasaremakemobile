/// <reference types="nativewind/types" />

import "nativewind/types";

declare module "react-native" {
  interface ViewProps {
    className?: string;
  }
  interface TextProps {
    className?: string;
  }
  interface SwitchProps {
    className?: string;
  }
  interface ImageProps {
    className?: string;
  }
  interface TextInputProps {
    className?: string;
  }
  interface TouchableOpacityProps {
    className?: string;
  }
}

declare module "*.css" {
  const content: any;
  export default content;
}
