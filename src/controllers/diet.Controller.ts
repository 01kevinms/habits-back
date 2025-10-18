import { FastifyReply, FastifyRequest } from "fastify";
import { NewDietBody, NutritionixFood } from "../types/fastify";

// GET: Retorna todas as dietas do usuário
export async function getDiet(req: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = req.user.id;
    if (!req.user) {
      return reply.code(401).send({ error: "Usuário não autenticado" });
    }
    const todaykey = new Date().toISOString().slice(0, 10);

    const diet = await req.server.prisma.diet.findMany({
      where: { userId, datekey: todaykey },
      include: { foods: true },
      orderBy: { createdAt: "desc" },
    });

    const totalCalories = diet.reduce((sum, d) => sum + d.foods.reduce((foodsum, f)=> foodsum + f.calories,0), 0);

    const status = await req.server.prisma.statusPhysical.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });

    const meta = status?.tmb ?? 0;
    const atingiumeta = totalCalories >= meta;

    return reply.send({
      diets: diet,
      totalCalories,
      meta,
      atingiumeta
    });

  } catch (error) {
    req.server.log.error(error);
    return reply.code(500).send({ error: "Erro ao buscar dietas" });
  }
}
export async function getDietProgress(req: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = req.user.id;

   const metadash = await req.server.prisma.statusPhysical.findFirst({
  where: { userId },
  orderBy: { createdAt: 'desc' },
});

const meta = metadash?.tmb ?? 0;
const goal = meta ?? 0; // pega o campo correto

 // valor padrão opcional
    const todayKey = new Date().toISOString().slice(0, 10);

    // 🔹 Busca todas as dietas do dia
    const diets = await req.server.prisma.diet.findMany({
      where: { userId, datekey: todayKey },
      include: { foods: true },
    });

    // 🔹 Soma todas as calorias
    const totalCalories = diets.reduce((acc, diet) => {
      const foodCalories = diet.foods?.reduce((sum, food) => sum + food.calories, 0) || 0;
      return acc + foodCalories;
    }, 0);

    // 🔹 Atualiza ou cria o progresso do dia
    const updated = await req.server.prisma.dietProgress.upsert({
  where: { userId_date: { userId, date: new Date(todayKey) } },
  update: {
    calories: totalCalories,
    achieved: totalCalories >= goal,
  },
  create: {
    userId,
    date: new Date(todayKey),
    calories: totalCalories,
    goal,
    achieved: totalCalories >= goal,
  },
});


    // 🔹 Busca o progresso completo para o histórico
    const progress = await req.server.prisma.dietProgress.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });

    // 🔹 Calcula a porcentagem do dia
    const percentage = updated.goal > 0
      ? Math.min((updated.calories / updated.goal) * 100, 100)
      : 0;

    // 🔹 Retorna o progresso completo e o resumo do dia
    return reply.send({
      today: {
        calories: updated.calories,
        goal: updated.goal,
        achieved: updated.achieved,
        percentage,
      },
      history: progress,
    });

  } catch (error) {
    req.server.log.error(error);
    return reply.code(500).send({ error: "Erro ao buscar progresso da dieta" });
  }
}

// POST: Cria uma nova dieta
export async function createDiet(
  req: FastifyRequest<{ Body: NewDietBody }>,
  reply: FastifyReply
) {
  try {
    const body = req.body as NewDietBody;
    const userId = req.user.id;
    const todaykey = new Date().toISOString().slice(0, 10);

    // Pega meta do usuário
    const status = await req.server.prisma.statusPhysical.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    const meta = status?.tmb ?? 0;

    // Cria dieta com os alimentos
    const createdDiet = await req.server.prisma.diet.create({
      data: {
        userId,
        type: body.type,
        description: body.description ?? "",
        period: body.period,
        datekey: todaykey,
        atingiumeta: false, // inicial, será calculado depois
        foods: {
          create: body.foods?.map(food => ({
            description: food.description,
            grams: food.grams,
            calories: food.calories,
            protein: food.protein,
            carbs: food.carbs,
          })),
        },
      },
      include: { foods: true },
    });

    // Atualiza atingiuMeta considerando calorias totais do dia
    const dietsToday = await req.server.prisma.diet.findMany({
      where: { userId, datekey: todaykey },
      include: { foods: true },
    });
    const totalCalories = dietsToday.reduce(
      (sum, d) => sum + d.foods.reduce((fSum, f) => fSum + f.calories, 0),
      0
    );

    const atingiuMeta = totalCalories >= meta;

    // Atualiza a dieta criada com atingiuMeta
    await req.server.prisma.diet.update({
      where: { id: createdDiet.id },
      data: { atingiumeta: atingiuMeta },
    });

    return reply.code(201).send({
      diet: createdDiet,
      totalCalories,
      meta,
      atingiuMeta,
    });
  } catch (err) {
    req.server.log.error(err);
    return reply.code(500).send({ error: "Erro ao criar dieta" });
  }
}

export async function createFood(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { dietId } = req.params as { dietId: string };
    const { description, grams } = req.body as { description: string; grams: number };

    if (!grams || grams <= 0)
      return reply.status(400).send({ error: "Gramas inválido" });

    // Busca o alimento na API Nutritionix
    const APP_ID = process.env.NUTRITIONIX_APP_ID!;
    const API_KEY = process.env.NUTRITIONIX_API_KEY!;

    const res = await fetch("https://trackapi.nutritionix.com/v2/natural/nutrients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-app-id": APP_ID,
        "x-app-key": API_KEY,
      },
      body: JSON.stringify({ query: description }),
    });

    if (!res.ok) {
      const text = await res.text();
      return reply.status(res.status).send({ error: "Erro da API Nutritionix", details: text });
    }

    const data = (await res.json()) as { foods: NutritionixFood[] };
    const foodData = data.foods[0];

    // Garante que temos um valor base válido
    const originalGrams = foodData.serving_weight_grams || foodData.serving_qty || 100;

    // Cálculo proporcional (baseado nas gramas enviadas)
    const factor = grams / originalGrams;

    const createdFood = await req.server.prisma.food.create({
      data: {
        dietId,
        description: foodData.food_name,
        grams,
        calories: foodData.nf_calories * factor,
        protein: foodData.nf_protein * factor,
        carbs: foodData.nf_total_carbohydrate * factor,
        originalCalories: foodData.nf_calories,
        originalProtein: foodData.nf_protein,
        originalCarbs: foodData.nf_total_carbohydrate,
        originalGrams, // ← agora sempre garantido
      },
    });

    return reply.code(201).send(createdFood);
  } catch (error) {
    req.server.log.error(error);
    return reply.status(500).send({ error: "Erro ao criar comida" });
  }
}

export async function updateDiet(req:FastifyRequest, reply:FastifyReply) {
  try {
    const { id } = req.params as {id: string};
    const body = req.body as NewDietBody;
const updatedDiet = await req.server.prisma.diet.update({ 
  where: { id }, 
  data: { period: body.period, 
    datekey: body.datekey, 
    description: body.description, 
    foods: { 
      create: body.foods?.filter(f => !f.id).map(food => ({ 
      description: food.description, 
      grams: food.grams, 
      calories: food.calories, 
      })) ?? [], 
      update: body.foods?.filter(f => f.id).map(food => ({ 
        where: { id: food.id }, 
        data: { description: food.description, 
          grams: food.grams, 
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs},
        })),
      },}, 
      include: { foods: true }, 
    }); 
    return reply.send(updatedDiet); } 
    catch (error) { 
      console.error("Erro ao atualizar dieta:", error); 
  return reply.status(500).send({ error: "Erro ao atualizar dieta" }); } 
}

export async function updateFood(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { grams } = req.body as { grams: number };
    const { id } = req.params as { id: string };

    if (!grams || grams <= 0) {
      return reply.status(400).send({ error: "Food grams inválido" });
    }

    // Busca o alimento no banco
    const food = await req.server.prisma.food.findUnique({ where: { id } });
    if (!food) return reply.status(404).send({ error: "Comida não encontrada" });

    // Garante que temos os valores originais
    if (!food.originalCalories || !food.originalProtein || !food.originalCarbs || !food.originalGrams) {
      return reply.status(500).send({ error: "Valores originais do alimento não encontrados" });
    }

    // Recalcula os macros proporcionalmente
    const factor = grams / food.originalGrams;

    const updatedFood = await req.server.prisma.food.update({
      where: { id },
      data: {
        grams,
        calories: food.originalCalories * factor,
        protein: food.originalProtein * factor,
        carbs: food.originalCarbs * factor,
      },
    });

    return reply.send(updatedFood);

  } catch (error) {
    req.server.log.error(error);
    return reply.status(500).send({ error: "Erro ao atualizar comida" });
  }
}

// DELETE: Deleta uma dieta específica
export async function deletDiet(
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Busca a dieta pelo ID
    const dietdelet = await req.server.prisma.diet.findUnique({ where: { id } });

    // Se não existir ou não pertencer ao usuário
    if (!dietdelet || dietdelet.userId !== userId) {
      return reply.code(404).send({ error: "Diet not found" });
    }

    // Deleta a dieta
    await req.server.prisma.food.deleteMany({ where: { dietId: id } });
    await req.server.prisma.diet.delete({ where: { id } });

    return reply.send({ success: true, message: "Diet deleted successfully" });
  } catch (error) {
    req.server.log.error(error);
    return reply.code(500).send({ error: "Erro ao deletar dieta" });
  }
}

export async function deleteFood(req:FastifyRequest, reply:FastifyReply) {
try {
  const { dietId, id } = req.params as { dietId: string, id: string };

  const food = await req.server.prisma.food.findUnique({where: {id}})
  if (!food) return reply.code(404).send({ error: "comida nao encontrada" });
 
  await req.server.prisma.food.delete({where:{id}})
} catch (error) {
  req.server.log.error(error);
  return reply.code(500).send({ error: "Erro ao deletar comida" });
  
}

}