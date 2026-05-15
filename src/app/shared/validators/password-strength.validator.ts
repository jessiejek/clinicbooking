import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function passwordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '');
    if (!value) return null;

    const hasMinLength = value.length >= 8;
    const hasUppercase = /[A-Z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecial = /[^A-Za-z0-9]/.test(value);

    const errors: ValidationErrors = {};
    if (!hasMinLength) errors['minLength'] = true;
    if (!hasUppercase) errors['uppercase'] = true;
    if (!hasNumber) errors['number'] = true;
    if (!hasSpecial) errors['special'] = true;

    return Object.keys(errors).length ? { passwordStrength: errors } : null;
  };
}

