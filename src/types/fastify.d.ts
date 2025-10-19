import { DietType, GenereType } from "@prisma/client";
import "fastify";

// Faz um "declare module" para expandir os tipos originais do Fastify
declare module "fastify" {
  // Adiciona a propriedade `user` dentro de FastifyRequest
  // Isso serve para quando o usuário estiver autenticado via JWT,
  // possamos acessar req.user.id e req.user.email em qualquer rota
  interface FastifyRequest {
    user: {
      id: string;     // ID do usuário autenticado
      email: string;  // Email do usuário autenticado
    };
  }
}
// Interface para tipar os dados de registro
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

// Interface para tipar os dados de login
export interface LoginRequest {
  email: string;
  password: string;
}

// Interface para o corpo da requisição ao criar hábito
export interface NewHabitBody {
  title: string;
  description?: string;
  frequency: "daily" | "weekly" | "monthly";
  time: string;
}

export interface NewDietBody {
  type: DietType;
  description?: string;
  period: "Manhã" | "meio-dia" | "noite";
  datekey: string;
  userId: string;
  foods?: NewFoodBody[];
}

export interface NewFoodBody {
  id: string
  description: string;
  grams: number;
  calories: number;
  protein?: number;
  carbs?: number;
}

export interface NewStatusPhysical{
    weight: number;
    height: number;
    imc: number;
    age: number;
    genere: GenereType;
    water: number;
}
export interface NutritionixFood {
  food_name: string;
  originalCalories: number;
  originalGrams: number;
  serving_weight_grams: number;
  serving_qty: number;
  serving_unit: string;
  nf_calories: number;
  nf_total_fat: number;
  nf_protein: number;
  nf_total_carbohydrate: number;
  photo: {
    thumb: string;
    highres: string;
  };
}
