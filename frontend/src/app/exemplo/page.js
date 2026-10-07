// Arquivo Exemplo para a criação de telas
// O conteúdo da página deve ser colocado aqui

// 1. IMPORTAÇÕES
// Aqui trazemos componentes que criamos na pasta "components" ou ferramentas do React.
// Os dois pontos (../) servem para "voltar" uma pasta e encontrar a pasta components.
import BotaoPedidoExemplo from '../../components/componente-exemplo/BotaoPedidoExemplo';

// 2. FUNÇÃO PRINCIPAL DA TELA
// Toda tela no React é uma função JavaScript que retorna HTML (JSX).
// O nome da função sempre deve começar com letra Maiúscula.
export default function Exemplo() {
  
  // 3. LÓGICA JAVASCRIPT (Opcional)
  // Antes do 'return', colocamos variáveis, listas de dados ou cálculos.
  const tituloDaPagina = "Bem-vindo ao Cardápio Gran Sabor";
  const descricao = "Esta página é um exemplo de como juntar uma tela com componentes menores.";

  // 4. O VISUAL DA TELA - {Return} (Obrigatório)
  // O 'return' é obrigatório. Aqui dentro vai todo o nosso HTML.
  // Regra: O return sempre precisa devolver UM elemento "pai" abraçando o resto (ex: uma <main>...</main>, <div>...</div> ou tag vazia < >...< />).
  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      
      {/* Para usar uma variável JavaScript dentro do HTML, colocamos entre chaves {} */}
      <h1>{tituloDaPagina}</h1>
      <p>{descricao}</p>
      
      <hr style={{ margin: '20px 0' }} />

      <h2>Testando nossos Componentes:</h2>
      
      {/* 5. Usando o Componente Exemplo */}
      {/* Em vez de criar o botão do zero 3 vezes, com toda a logica repetida e custosa, simplesmente chamamos o componente que criamos.
          Passamos a propriedade (prop) 'nomeDoPrato' para que o botão saiba o que exibir. */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
        
        <BotaoPedidoExemplo nomeDoPrato="Lasanha" />
        
        <BotaoPedidoExemplo nomeDoPrato="Pizza Margherita" />
        
        <BotaoPedidoExemplo nomeDoPrato="Suco de Laranja" />
        
      </div>

    </main>
  );
}