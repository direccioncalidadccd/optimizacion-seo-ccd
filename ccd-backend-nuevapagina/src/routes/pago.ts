import { Router, Request, Response, NextFunction } from 'express';
import request from 'request';

const router = Router();

const username: string = '13390147';        // USUARIO
const password: string = 'testpassword_aa7aL2O0Ac5JuQo8D1gXXmju9jxICqnW30LZxrKgSe78s';        // CONTRASEÑA API REST
const endpoint: string = 'https://api.micuentaweb.pe';        // SERVIDOR
const auth: string = 'Basic ' + Buffer.from(username + ':' + password).toString('base64');

interface Order {
    amount: number;
    currency: string;
    orderId: string;
    customer: {
        email: string;
    };
    transactionOptions?: {
        cardOptions?: {
            installmentNumber?: number;
        };
    };
}

const isEmptyObject = (obj: any): boolean => {
    return Object.keys(obj).length === 0;
};

router.post('/CreatePayment', (req: Request, res: Response, next: NextFunction) => {
    let order: Order = req.body;

    if (isEmptyObject(order)) {
        order = {
            amount: 200,
            currency: "PEN",
            orderId: "myOrderId-999999",
            customer: {
                email: "sample@example.com"
            }
        };
    }

    request.post({
        url: `${endpoint}/api-payment/V4/Charge/CreatePayment`,
        headers: {
            'Authorization': auth,
            'Content-Type': 'application/json'
        },
        json: order
    }, (error: any, response: request.Response, body: any) => {
        if (body?.status === 'SUCCESS') {
            const formToken = body.answer.formToken;

            res.send(formToken);
        } else {
            console.error(body);
            res.status(500).send('error');
        }
    });
});

router.post('/validatePayment', (req: Request, res: Response, next: NextFunction) => {
    
    const clientAnswer = req.body.clientAnswer;

    // Validamos que clientAnswer y transactions existan
    if (clientAnswer && clientAnswer.transactions && clientAnswer.transactions.length > 0) {
        const transaction = clientAnswer.transactions[0];
        
        if (clientAnswer.orderStatus === "PAID" && transaction.detailedStatus === "AUTHORISED") {
            return res.status(200).send('Pago validado exitosamente');
        } else {
            return res.status(400).send('Pago no válido o fallido');
        }
    } else {
        return res.status(400).send('Datos de transacción no válidos o incompletos');
    }
});







export default router;
