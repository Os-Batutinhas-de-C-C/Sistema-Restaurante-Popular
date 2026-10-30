import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
} from "@mui/material";
import styles from "./modalRefeicao.module.css";

export default function ModalRefeicao({ refeicao, onClose }) {
    return (
        <Dialog
            open={Boolean(refeicao)}
            onClose={onClose}
            aria-labelledby="meal-dialog-title"
            fullWidth
            maxWidth="sm"
        >
            {refeicao && (
                <>
                    <DialogTitle id="meal-dialog-title">
                        {refeicao.nome} · {refeicao.data}
                    </DialogTitle>
                    <DialogContent dividers>
                        <Typography className={styles.detail}>
                            <strong>Prato principal:</strong> {refeicao.refeicao.pratoPrincipal}
                        </Typography>
                        <Typography className={styles.detail}>
                            <strong>Opção proteica:</strong> {refeicao.refeicao.opcaoProteica}
                        </Typography>
                        <Typography className={styles.detail}>
                            <strong>Acompanhamentos:</strong> {refeicao.refeicao.acompanhamentos}
                        </Typography>
                        <Typography className={styles.detail}>
                            <strong>Salada:</strong> {refeicao.refeicao.salada}
                        </Typography>
                        <Typography className={styles.detail}>
                            <strong>Sobremesa:</strong> {refeicao.refeicao.sobremesa}
                        </Typography>
                        <Typography className={styles.detail}>
                            <strong>Suco:</strong> {refeicao.refeicao.suco}
                        </Typography>
                        <Typography className={styles.detail}>
                            <strong>Valor Calórico Estimado (kcal):</strong> {refeicao.refeicao.calorias}
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={onClose}>Fechar</Button>
                    </DialogActions>
                </>
            )}
        </Dialog>
    );
}
