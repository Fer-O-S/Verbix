import { LoginFormData, RegisterFormData, ValidationResult } from "@/types";

export class ValidationUtils {
  /**
   * Valida un email
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida una contraseña
   */
  static isValidPassword(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 6) {
      errors.push("Debe tener al menos 6 caracteres");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("Debe tener al menos una mayúscula");
    }

    if (!/[a-z]/.test(password)) {
      errors.push("Debe tener al menos una minúscula");
    }

    if (!/\d/.test(password)) {
      errors.push("Debe tener al menos un número");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Valida formulario de registro
   */
  static validateRegisterForm(data: RegisterFormData): ValidationResult {
    const errors: Record<string, string> = {};

    // Validar nombre
    if (!data.displayName.trim()) {
      errors.displayName = "El nombre es requerido";
    } else if (data.displayName.trim().length < 2) {
      errors.displayName = "El nombre debe tener al menos 2 caracteres";
    }

    // Validar email
    if (!data.email.trim()) {
      errors.email = "El correo es requerido";
    } else if (!this.isValidEmail(data.email)) {
      errors.email = "El formato del correo no es válido";
    }

    // Validar contraseña
    if (!data.password) {
      errors.password = "La contraseña es requerida";
    } else {
      const passwordValidation = this.isValidPassword(data.password);
      if (!passwordValidation.isValid) {
        errors.password = passwordValidation.errors[0]; // Solo mostrar el primer error
      }
    }

    // Validar confirmación de contraseña
    if (!data.confirmPassword) {
      errors.confirmPassword = "Confirma tu contraseña";
    } else if (data.password !== data.confirmPassword) {
      errors.confirmPassword = "Las contraseñas no coinciden";
    }

    // Validar términos y condiciones
    if (!data.acceptTerms) {
      errors.acceptTerms = "Debes aceptar los términos y condiciones";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Valida formulario de login
   */
  static validateLoginForm(data: LoginFormData): ValidationResult {
    const errors: Record<string, string> = {};

    // Validar email
    if (!data.email.trim()) {
      errors.email = "El correo es requerido";
    } else if (!this.isValidEmail(data.email)) {
      errors.email = "El formato del correo no es válido";
    }

    // Validar contraseña
    if (!data.password) {
      errors.password = "La contraseña es requerida";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Valida email para reset de contraseña
   */
  static validateResetPasswordEmail(email: string): ValidationResult {
    const errors: Record<string, string> = {};

    if (!email.trim()) {
      errors.email = "El correo es requerido";
    } else if (!this.isValidEmail(email)) {
      errors.email = "El formato del correo no es válido";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }
}
