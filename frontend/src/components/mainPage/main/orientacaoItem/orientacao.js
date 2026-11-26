import AccessibleIcon from '@mui/icons-material/Accessible';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import PermIdentityIcon from '@mui/icons-material/PermIdentity';

export const ORIENTACOES = [
    {
        id: "regras",
        symbolId: "regrasSymbol",
        icon: <VolunteerActivismIcon />,
        titulo: "Regras de convivência no salão",
        resumo: "Ajude a manter o refeitório limpo e acolhedor para todos",
        detalhe: [
            "Higienize as mãos antes da refeição.",
            "Sirva-se apenas da quantidade que pretende consumir e evite desperdícios.",
            "Mantenha mesas e cadeiras organizadas e descarte os resíduos nos locais indicados.",
            "Respeite as outras pessoas e mantenha um tom de voz agradável no salão.",
        ]
    },
    {
        id: "fila",
        symbolId: "filaSymbol",
        icon: <AccessibleIcon />,
        titulo: "Fila e prioridades previstas em lei",
        resumo: "Atendimento prioritário para idosos, gestantes e PcD",
        detalhe: [
            "Respeite a ordem de atendimento e as orientações da equipe.",
            "Pessoas com direito à prioridade legal podem procurar a equipe para receber orientação.",
        ]
    },
    {
        id: "cadastro",
        symbolId: "cadastroSymbol",
        icon: <PermIdentityIcon />,
        titulo: "Cadastro Único e CRAS",
        resumo: "Consulte se você pode receber isenção ou subsídio",
        detalhe: [
            "Procure o CRAS ou a equipe de atendimento para consultar os critérios e documentos necessários.",
            "A concessão de isenção ou subsídio depende das regras municipais vigentes.",
        ]
    }
];
