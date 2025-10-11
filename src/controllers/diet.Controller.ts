import { FastifyReply, FastifyRequest } from "fastify";
import { NewDietBody, NewFoodBody } from "../types/fastify";

// GET: Retorna todas as dietas do usuário
export async function getDiet(req: FastifyRequest, reply: FastifyReply) {
  try {
    if (!req.user) {
      return reply.code(401).send({ error: "Usuário não autenticado" });
    }

    const userId = req.user.id;
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

    // Retornar objeto bem definido
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

export async function createFood(req:FastifyRequest, reply:FastifyReply) {
  try {
    const dietId = req.params as {dietId: string};
    const body = req.body as NewFoodBody;
    if(!body.description || !body.grams ) {
      return reply.code(400).send({error: "description e grams são obrigatórios"})
    }

const food = await req.server.prisma.food.create({
  data:{
    description: body.description,
    grams: body.grams,
    calories: body.calories,
    protein: body.protein,
    carbs: body.carbs,
    dietId: dietId.dietId
  }
})
return reply.code(201).send(food)
  } catch (error) {
    req.server.log.error(error);
    return reply.code(500).send({ error: "Erro ao criar comida" });
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

export async function updateFood(req:FastifyRequest, reply:FastifyReply) {
  try {
    const {grams} =req.body as {grams: number};
    const {id}= req.params as{id: string};

const food = await req.server.prisma.food.findUnique({
  where: {id}
})
if(grams === 0) return reply.status(400).send({error: "Food grams inválido"});
if (!food) return reply.code(404).send({ error: "comida nao encontrada" });

const updatedFood = await req.server.prisma.food.update({
  where: {id},
  data:{
    grams,
    calories: (food.calories / food.grams) * grams,
    protein: (food.protein / food.grams) * grams,
    carbs: (food.carbs / food.grams) * grams,
  }
})
return reply.send(updatedFood);
  } catch (error) {
    req.server.log.error(error);
    return reply.code(500).send({ error: "Erro ao atualizar comida" });
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