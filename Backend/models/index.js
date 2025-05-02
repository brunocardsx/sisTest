// CORRETO: Produto NÃO deve ter relação com Obra
const NotaFiscal = require('./NotaFiscal');
const ItemNotaFiscal = require('./ItemNotaFiscal');
const Obra = require('./Obra');
const Produto = require('./Produto');

NotaFiscal.belongsTo(Obra, { foreignKey: 'obra_id' });
Obra.hasMany(NotaFiscal, { foreignKey: 'obra_id' });

NotaFiscal.hasMany(ItemNotaFiscal, { foreignKey: 'nota_fiscal_id' });
ItemNotaFiscal.belongsTo(NotaFiscal, { foreignKey: 'nota_fiscal_id' });

ItemNotaFiscal.belongsTo(Produto, { foreignKey: 'produto_id' });
Produto.hasMany(ItemNotaFiscal, { foreignKey: 'produto_id' });

module.exports = {
    NotaFiscal,
    ItemNotaFiscal,
    Obra,
    Produto
};
