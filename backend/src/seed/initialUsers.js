import bcrypt from "bcryptjs";
import User from "../model/user.js";

const initialUsers = [
  { name: "admin", password: "admin", role: "admin" },
  { name: "ana", password: "ana12345", role: "user" },
  { name: "beto", password: "beto12345", role: "user" },
];

const crearUsuariosIniciales = async () => {
  for (const usuario of initialUsers) {
    const existente = await User.findOne({
      where: { name: usuario.name },
    });

    if (!existente) {
      await User.create({
        name: usuario.name,
        password: usuario.password,
        passwordHash: await bcrypt.hash(usuario.password, 10),
        role: usuario.role,
        ownerId: null,
      });

      console.log(`Usuario inicial creado: ${usuario.name}`);
    }
  }
};

export default crearUsuariosIniciales;
