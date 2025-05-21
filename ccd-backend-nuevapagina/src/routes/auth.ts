import { Router} from 'express';
import { buscarUsuario } from '../controllers/auth/login';
import { crearUsuariov2 } from '../controllers/auth/register';
const router= Router();

router.post('/buscarUsuario',buscarUsuario)
router.post('/crearUsuariov2', crearUsuariov2)
export default router;  