import React from 'react';
import { FormControl, Grid, InputLabel, MenuItem, Select } from '@mui/material';
import {
    GEOGRAFIAS,
    SETORES_B3,
    SUBSETORES_B3,
    setorDoSubsetor,
    subsetoresDoSetor,
} from '../../constants/taxonomiaB3';

/**
 * Trio de selects opcionais de classificação de ativo (setor / subsetor /
 * geografia) — compartilhado entre AdicionarAtivoForm e EditarAtivoDialog.
 *
 * Regras de coerência (espelham a validação do backend):
 *  - subsetor é FILTRADO pelo setor selecionado (sem setor → lista completa);
 *  - escolher subsetor sem setor auto-preenche o setor pai;
 *  - trocar o setor limpa um subsetor incompatível.
 *
 * Deve ser renderizado dentro de um <Grid container>.
 *
 * @param {{ value: {setor: string, subsetor: string, geografia: string},
 *           onChange: (next: object) => void,
 *           gridSize?: object }} props
 */
const ClassificacaoAtivoSelects = ({ value, onChange, gridSize = { xs: 12, sm: 4 } }) => {
    const { setor, subsetor, geografia } = value;

    const handleSetorChange = (e) => {
        const novoSetor = e.target.value;
        // Trocar o setor limpa o subsetor incompatível (mantém o compatível).
        const subsetorCoerente =
            subsetor && setorDoSubsetor(subsetor) === novoSetor ? subsetor : '';
        onChange({ ...value, setor: novoSetor, subsetor: subsetorCoerente });
    };

    const handleSubsetorChange = (e) => {
        const novoSubsetor = e.target.value;
        // Subsetor escolhido sem setor → auto-preenche o setor pai.
        const setorDerivado = novoSubsetor ? (setor || setorDoSubsetor(novoSubsetor)) : setor;
        onChange({ ...value, setor: setorDerivado || '', subsetor: novoSubsetor });
    };

    const handleGeografiaChange = (e) => {
        onChange({ ...value, geografia: e.target.value });
    };

    const subsetoresVisiveis = setor ? subsetoresDoSetor(setor) : SUBSETORES_B3;

    return (
        <>
            <Grid size={gridSize}>
                <FormControl size="small" fullWidth>
                    <InputLabel id="setor-label">Setor</InputLabel>
                    <Select
                        labelId="setor-label"
                        label="Setor"
                        value={setor}
                        onChange={handleSetorChange}
                        inputProps={{ 'data-testid': 'select-setor' }}
                    >
                        <MenuItem value="">
                            <em>Não classificar</em>
                        </MenuItem>
                        {SETORES_B3.map((s) => (
                            <MenuItem key={s.value} value={s.value}>
                                {s.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>

            <Grid size={gridSize}>
                <FormControl size="small" fullWidth>
                    <InputLabel id="subsetor-label">Subsetor</InputLabel>
                    <Select
                        labelId="subsetor-label"
                        label="Subsetor"
                        value={subsetor}
                        onChange={handleSubsetorChange}
                        inputProps={{ 'data-testid': 'select-subsetor' }}
                    >
                        <MenuItem value="">
                            <em>Não classificar</em>
                        </MenuItem>
                        {subsetoresVisiveis.map((s) => (
                            <MenuItem key={s.value} value={s.value}>
                                {s.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>

            <Grid size={gridSize}>
                <FormControl size="small" fullWidth>
                    <InputLabel id="geografia-label">Geografia</InputLabel>
                    <Select
                        labelId="geografia-label"
                        label="Geografia"
                        value={geografia}
                        onChange={handleGeografiaChange}
                        inputProps={{ 'data-testid': 'select-geografia' }}
                    >
                        <MenuItem value="">
                            <em>Não classificar</em>
                        </MenuItem>
                        {GEOGRAFIAS.map((g) => (
                            <MenuItem key={g.value} value={g.value}>
                                {g.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
        </>
    );
};

export default ClassificacaoAtivoSelects;
