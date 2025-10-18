import { FastifyReply, FastifyRequest } from "fastify";
import { NewStatusPhysical } from "../types/fastify";

export async function getStatus(req: FastifyRequest, reply: FastifyReply){
try {
    const userId = req.user.id;
    const todayKey = new Date().toISOString().slice(0,10)
   
    const status= await req.server.prisma.statusPhysical.findMany({
        where:{userId, datekey:todayKey},
        orderBy: { createdAt: "desc" }
    })
    return reply.send(status)
} catch (error) {
    req.server.log.error(error)
    return reply.code(500).send({error: "Erro ao buscar status fisicos"})
}

}

export async function getWaterProgress(req: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = req.user.id;
    const todayKey = new Date().toISOString().slice(0, 10);
const todayDate = new Date();
todayDate.setHours(0, 0, 0, 0); // define 00:00:00 para evitar problemas de comparação

    // Busca status físico do dia para pegar a meta de água
    const waterDash = await req.server.prisma.statusPhysical.findFirst({
      where: { userId, datekey: todayKey },
      orderBy: { createdAt: "desc" },
    });

    const metawater = waterDash?.metawater ?? 0;

    // Busca todos os registros de água do dia
   const statuswater = await req.server.prisma.waterProgress.findMany({
  where: { userId, date: todayDate },
});

    const totalML = statuswater.reduce((sum, d) => sum + (d.water ?? 0), 0);

    // Cria ou atualiza registro do dia
 const updated = await req.server.prisma.waterProgress.upsert({
  where: { userId_dates: { userId, date: todayDate } },
  update: {
    water: totalML,
    achieved: totalML >= metawater,
  },
  create: {
    userId,
    date: todayDate,
    water: totalML,
    goal: metawater,
    achieved: totalML >= metawater,
  },
});

    const percentage = metawater > 0 ? Math.min((updated.water / metawater) * 100, 100) : 0;

    return reply.send({
      today: {
        id: updated.id,
        water: updated.water,
        goal: updated.goal,
        achieved: updated.achieved,
        percentage,
      },
      history: statuswater,
    });
  } catch (err) {
    req.server.log.error(err);
    return reply.code(500).send({ error: "Erro ao buscar progresso da água" });
  }
}

export async function createStatus(
  req: FastifyRequest, 
  reply: FastifyReply
) {
  try {
    // Desestruturação do body
    const { weight, height, age, genere} =req.body as NewStatusPhysical
    const todayKey = new Date().toISOString().slice(0,10)
    // Pega o ID do usuário autenticado
    const userId = req.user.id;

    // Validações
    if (age == null) {
      return reply.code(400).send({ error: "O campo 'age' é obrigatório." });
    } if (!genere) {
      return reply.code(400).send({ error: "O campo 'genere' é obrigatório." });
    }

  

    const heightCm = height * 100; // Exemplo: 1.75m → 175cm
    const waterforperson = 35 * weight

// Calcula o IMC (Índice de Massa Corporal)
// Fórmula: peso (kg) / (altura (m) * altura (m))
const imc = Number((weight / (height * height)).toFixed(2));
    // Calcula TMB (Taxa Metabólica Basal) baseado no gênero
  const tmb =
  genere === "masculine"
    ? 88.36 + (13.4 * weight) + (4.8 * heightCm) - (5.7 * age) // fórmula para homens
    : 447.6 + (9.2 * weight) + (3.1 * heightCm) - (4.3 * age); // fórmula para mulheres

    
    // Cria a dieta no banco
   const createdstatus = await req.server.prisma.statusPhysical.create({
  data: {
    userId, 
    height, 
    weight, 
    imc, 
    age, 
    genere, 
    tmb,
    datekey:todayKey,
    metawater:waterforperson,
    }
});
await req.server.prisma.waterProgress.upsert({
  where:{userId_dates:{userId, date: new Date(todayKey)}},
  update:{},
  create:{
    userId,
    date: new Date(todayKey),
    water:0,
    goal: createdstatus.metawater ??0,
    achieved: false
  }
  })
    // Retorna a dieta criada
    return reply.code(201).send(createdstatus);
  } catch (err) {
    req.server.log.error(err);
    return reply.code(500).send({ error: "Erro ao criar dieta" });
  }
}

export async function updateWater(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = req.params as { id: string };
    const { water } = req.body as { water: number };
    
    
    const progress = await req.server.prisma.waterProgress.findUnique({ where: { id } });
    if (!progress) {
      return reply.code(404).send({ error: "Progresso de água não encontrado" });
    }

       const status = await req.server.prisma.statusPhysical.findFirst({
        where: {
        userId: progress.userId,
        datekey: progress.date.toISOString().slice(0, 10),},
        orderBy: { createdAt: "desc" },});
    if (!status) {
      return reply.code(404).send({ error: "Status físico não encontrado" });
    }

    // Verifica se atingiu a meta de água
    const atingiuMeta = status?.metawater ?? 0;
    // Soma o novo consumo com o já existente
    const newWaterConsume = (progress.water ?? 0) + water;

    // Atualiza no banco
    const updated = await req.server.prisma.waterProgress.update({
      where: { id },
      data: {
        water: newWaterConsume,
        achieved: newWaterConsume >= atingiuMeta, // se quiser marcar que atingiu meta
      },
    });

    return reply.send(updated);
  } catch (err) {
    req.server.log.error(err);
    return reply.code(500).send({ error: "Erro ao atualizar consumo de água" });
  }
}

export async function deleteStatus( req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply) {
  try {
     const userId = req.user.id;
    const { id } = req.params;

   
    const deletests= await req.server.prisma.statusPhysical.findUnique({where:{id}})
    if (!deletests || deletests.userId !== userId) {
      return reply.code(404).send({ error: "Diet not found" });
    }
await req.server.prisma.statusPhysical.delete({where:{id}})
    return reply.send({ success: true, message: "Diet deleted successfully" });
  } catch (error) {
    req.server.log.error(error);
    return reply.code(500).send({ error: "Erro ao deletar dieta" });
  }
}