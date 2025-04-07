// Middleware de autenticação corrigido
import { authAdmin } from "../database/connectioDBAdimin.js";

export async function authenticateToken(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            console.log("Autenticação falhou: Header Authorization ausente");
            return res.status(401).json({ message: "Usuário não autorizado" });
        }
        
        // Extrair o token do formato "Bearer TOKEN"
        const parts = authHeader.split(' ');
        
        if (parts.length !== 2) {
            console.log("Autenticação falhou: Formato inválido do token");
            return res.status(401).json({ message: "Formato de token inválido" });
        }
        
        const [scheme, token] = parts;
        
        if (!/^Bearer$/i.test(scheme)) {
            console.log("Autenticação falhou: Esquema Bearer não encontrado");
            return res.status(401).json({ message: "Formato de token inválido" });
        }
        
        // Tratamento de token vazio
        if (!token) {
            console.log("Autenticação falhou: Token vazio");
            return res.status(401).json({ message: "Token não fornecido" });
        }
        
        console.log("Verificando token:", token.substring(0, 20) + "...");
        
        try {
            // Verificar token com Firebase Auth
            const decodedToken = await authAdmin.verifyIdToken(token);
            console.log("Token verificado com sucesso, uid:", decodedToken.uid);
            
            // Adicionar informações do usuário ao objeto de requisição
            req.user = { 
                uid: decodedToken.uid,
                email: decodedToken.email,
                // Adicione outros campos conforme necessário
            };
            
            // Seguir para o próximo middleware/controller
            next();
        } catch (verifyError) {
            console.error("Erro ao verificar token:", verifyError.message);
            
            // Tentar como token personalizado (secundário)
            try {
                // Extrair UID do token (isso depende da estrutura do seu token)
                // Esta é uma abordagem simplificada - você pode precisar ajustar
                const uid = extractUidFromCustomToken(token);
                
                if (uid) {
                    console.log("Usando UID extraído do token personalizado:", uid);
                    req.user = { uid };
                    return next();
                }
                
                // Se não conseguimos extrair UID, tentamos tratar como Firebase ID Token novamente
                throw new Error("Não foi possível extrair UID do token personalizado");
            } catch (customTokenError) {
                console.error("Erro ao processar token personalizado:", customTokenError.message);
                return res.status(401).json({ message: "Usuário não autorizado" });
            }
        }
    } catch (error) {
        console.error("Erro geral na autenticação:", error.message);
        return res.status(500).json({ message: "Erro interno na autenticação" });
    }
}

// Função auxiliar para extrair UID de um token personalizado
// NOTA: Isso é uma implementação básica e pode precisar ser adaptada
function extractUidFromCustomToken(token) {
    try {
        // Tokens JWT têm 3 partes separadas por pontos
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }
        
        // Decodificar a parte do payload (segunda parte)
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        
        // Verificar se o payload tem um campo uid ou sub
        return payload.uid || payload.sub || null;
    } catch (error) {
        console.error("Erro ao extrair UID do token:", error.message);
        return null;
    }
}