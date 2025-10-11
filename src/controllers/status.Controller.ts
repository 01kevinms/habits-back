import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { NewStatusPhysical } from "../types/fastify";

export async function getStatus(req: FastifyRequest, reply: FastifyReply){
try {
    const userId = req.user.id;
    if (!req.user) {
        return reply.code(401).send({error: "Usuário não autenticado"})
    }
    const status= await req.server.prisma.statusPhysical.findMany({
        where:{userId},
        orderBy: { createdAt: "desc" }
    })
    return reply.send(status)
} catch (error) {
    req.server.log.error(error)
    return reply.code(500).send({error: "Erro ao buscar status fisicos"})
}

}

export async function createStatus(
  req: FastifyRequest<{ Body: NewStatusPhysical }>, // Tipagem explícita do body
  reply: FastifyReply
) {
  try {
    // Desestruturação do body
    const { weight, height, age, genere } =
      req.body;

    // Pega o ID do usuário autenticado
    const userId = req.user.id;

    // Validações
    if (age == null) {
      return reply.code(400).send({ error: "O campo 'age' é obrigatório." });
    }
    if (!genere) {
      return reply.code(400).send({ error: "O campo 'genere' é obrigatório." });
    }
const heightCm = height * 100; // Exemplo: 1.75m → 175cm

// Calcula o IMC (Índice de Massa Corporal)
// Fórmula: peso (kg) / (altura (m) * altura (m))
const imc = Number((weight / (height * height)).toFixed(2));
    // Calcula TMB (Taxa Metabólica Basal) baseado no gênero
  const tmb =
  genere === "masculine"
    ? 88.36 + (13.4 * weight) + (4.8 * heightCm) - (5.7 * age) // fórmula para homens
    : 447.6 + (9.2 * weight) + (3.1 * heightCm) - (4.3 * age); // fórmula para mulheres

    // Cria a dieta no banco
   const created = await req.server.prisma.statusPhysical.create({
  data: {userId, height, weight, imc, age, genere, tmb }
});


    // Retorna a dieta criada
    return reply.code(201).send({
      id: created.id,
      height: created.height,
      weight: created.weight,
      imc: created.imc,
      age: created.age,
      genere: created.genere,
      tmb: created.tmb,
      userId: created.userId,
      createdAt: created.createdAt,
    });
  } catch (err) {
    req.server.log.error(err);
    return reply.code(500).send({ error: "Erro ao criar dieta" });
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