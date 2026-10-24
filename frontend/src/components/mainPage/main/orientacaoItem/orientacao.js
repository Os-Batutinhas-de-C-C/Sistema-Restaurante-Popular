import AccessibleIcon from '@mui/icons-material/Accessible';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import PermIdentityIcon from '@mui/icons-material/PermIdentity';

export const ORIENTACOES = [
    {
        id: "regras",
        symbolId: "regrasSymbol",
        icon: <VolunteerActivismIcon />,
        titulo: "Regras de convivência & Salão",
        resumo: "Normas de boa convivência e higiene no refeitório",
        detalhe: "Especificação longa da regra de convivência..."
    },
    {
        id: "fila",
        symbolId: "filaSymbol",
        icon: <AccessibleIcon />,
        titulo: "Fila & Prioridades por lei",
        resumo: "Atendimento prioritário para idosos, gestantes e PcD",
        detalhe: "Especificação longa sobre as prioridades legais..."
    },
    {
        id: "cadastro",
        symbolId: "cadastroSymbol",
        icon: <PermIdentityIcon />,
        titulo: "Cadastro Único & CRAS",
        resumo: "Críterios de isenção ou subsídio integral",
        detalhe: "Especificação longa sobre CadÚnico e subsídios..."
    }
];