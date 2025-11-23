<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import type { ResultData } from './+page';
	import { getIdentityFromStorage } from '../identity/identity.storage';

	let displayData: ResultData | null = null;
	let isSubmitting = true;
	let submitError: string | null = null;

	async function submitResults() {
		isSubmitting = true;
		submitError = null;

		try {
			const identityData = getIdentityFromStorage();
			
			const response = await fetch('/api/submit-results', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					identityData,
					score: displayData?.d || ''
				})
			});

			if (!response.ok) {
				throw new Error('Failed to submit results');
			}

			// Success
			isSubmitting = false;
		} catch (error) {
			console.error('Error submitting results:', error);
			submitError = 'Échec de l\'envoi de vos résultats. Veuillez réessayer.';
			isSubmitting = false;
		}
	}

	// Only check state, redirect if not present
	onMount(() => {
		const state =  $page.state as any;
    // const state = { block3Cond: 'AB', feedback: 'Votre score indique...', d: '0.45' }; // For testing
		
		if (state?.block3Cond && state?.feedback) {
			displayData = {
				block3Cond: state.block3Cond,
				feedback: state.feedback,
				d: state.d || ''
			};
			
			// Submit results if we have a score
			if (state.d) {
				submitResults();
			} else {
				isSubmitting = false;
			}
		} else {
			// No state, redirect to /iat
			goto('/iat');
		}
	});
</script>

{#if displayData}
	{#if isSubmitting}
		<div class="loader-container">
			<div class="loader"></div>
			<p>Calcul du résultat...</p>
		</div>
	{:else if submitError}
		<div class="error-container">
			<div class="error-message">
				<h2>⚠️ Erreur de calcul</h2>
				<p>{submitError}</p>
			</div>
			<button on:click={submitResults} class="button retry">
				Réessayer
			</button>
		</div>
	{:else}
		<div class="results-container">
			<h1>Résultats du test</h1>
			
			<div class="feedback-section">
				<h2>Retour</h2>
				<p class="feedback">{displayData.feedback}</p>
			</div>

			{#if displayData.d}
				<div class="score-section">
					<h2>Score</h2>
					<p class="score">{displayData.d}</p>
				</div>
			{/if}

			<div class="description-section">
				<h2>⚠️ Avertissement</h2>
				<p>Ces résultats à l'IAT sont fournis uniquement à des fins éducatives. Les résultats peuvent fluctuer et ne doivent pas être utilisés pour prendre des décisions importantes. Les résultats sont influencés par des variables liées au test (par exemple, les mots ou images utilisés pour représenter les catégories) et à la personne (par exemple, la fatigue, ce à quoi vous pensiez avant l'IAT).</p>

				<h2>Comment fonctionne l'IAT?</h2>
				<p>L'IAT mesure les associations entre des concepts (par exemple, Personnes blanches et Personnes noires) et des évaluations (par exemple, Bon, Mauvais). Les gens réagissent plus rapidement lorsque les éléments qui sont plus étroitement liés dans leur esprit partagent le même bouton. Par exemple, une préférence implicite pour Personnes blanches par rapport à Personnes noires signifie que vous êtes plus rapide pour trier les mots lorsque 'Personnes blanches' et 'Bon' partagent un bouton comparativement à lorsque 'Personnes noires' et 'Bon' partagent un bouton.</p>
				
				<p>Les études qui résument les données de nombreuses personnes constatent que l'IAT prédit la discrimination dans le recrutement, l'éducation, les soins de santé et l'application de la loi. Cependant, faire un IAT une fois (comme vous venez de le faire) ne prédit probablement pas bien votre comportement futur.</p>

				<div class="info-links">
					<p>Pour plus d'informations sur les tests rendez-vous sur le site officiel de développement des TAI :</p>
					<a href="https://implicit.harvard.edu/implicit/" target="_blank" rel="noopener noreferrer">https://implicit.harvard.edu/implicit/</a>
					
					<p>Pour plus de réponses à des questions sur les tests que vous pourriez vous poser rendez-vous ici :</p>
					<a href="https://www.projectimplicit.net/resources/about-the-iat/" target="_blank" rel="noopener noreferrer">https://www.projectimplicit.net/resources/about-the-iat/</a>
				</div>

				<div class="reference">
					<h3>Référence initiale du projet TAI</h3>
					<p class="citation">Nosek, B. A., Smyth, F. L., Hansen, J. J., Devos, T., Lindner, N. M., Ratliff (Ranganath), K. A., Smith, C. T., Olson, K. R., Chugh, D., Greenwald, A. G., & Banaji, M. R. (2007). Pervasiveness and correlates of implicit attitudes and stereotypes. European Review of Social Psychology, 18, 36-88.</p>
				</div>
			</div>

			<div class="actions">
				<a href="/iat" class="button">Refaire le test</a>
				<a href="/" class="button secondary">Retour à l'accueil</a>
			</div>
		</div>
	{/if}
{/if}

<style>
	.loader-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 400px;
		gap: 1.5rem;
	}

	.loader {
		width: 50px;
		height: 50px;
		border: 4px solid #f3f3f3;
		border-top: 4px solid #2563eb;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.loader-container p {
		font-size: 1.1rem;
		color: #6b7280;
	}

	.error-container {
		max-width: 600px;
		margin: 2rem auto;
		padding: 2rem;
		text-align: center;
	}

	.error-message {
		background: #fee2e2;
		border: 2px solid #ef4444;
		border-radius: 8px;
		padding: 2rem;
		margin-bottom: 1.5rem;
	}

	.error-message h2 {
		color: #dc2626;
		margin-bottom: 1rem;
	}

	.error-message p {
		color: #991b1b;
		font-size: 1rem;
	}

	.results-container {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
	}

	h1 {
		font-size: 2rem;
		margin-bottom: 2rem;
		text-align: center;
	}

	h2 {
		font-size: 1.5rem;
		margin-bottom: 1rem;
		color: #333;
	}

	.feedback-section,
	.score-section,
	.description-section {
		background: #f5f5f5;
		padding: 1.5rem;
		border-radius: 8px;
		margin-bottom: 1.5rem;
	}

	.description-section {
		background: #fefce8;
		border-left: 4px solid #eab308;
	}

	.description-section h2 {
		margin-top: 1.5rem;
	}

	.description-section h2:first-child {
		margin-top: 0;
	}

	.description-section h3 {
		font-size: 1.2rem;
		margin-bottom: 0.5rem;
		color: #333;
	}

	.description-section p {
		margin-bottom: 1rem;
		line-height: 1.6;
	}

	.info-links {
		margin: 1.5rem 0;
	}

	.info-links a {
		display: block;
		color: #2563eb;
		text-decoration: none;
		margin-bottom: 1rem;
		word-break: break-all;
	}

	.info-links a:hover {
		text-decoration: underline;
	}

	.info-links p {
		margin-bottom: 0.5rem;
		margin-top: 1rem;
	}

	.reference {
		margin-top: 2rem;
		padding-top: 1.5rem;
		border-top: 1px solid #d4d4d4;
	}

	.citation {
		font-style: italic;
		color: #4b5563;
		font-size: 0.95rem;
	}

	.feedback,
	.score {
		font-size: 1.1rem;
		line-height: 1.6;
		margin: 0;
	}

	.score {
		font-weight: 600;
		color: #2563eb;
	}

	.actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
		margin-top: 2rem;
	}

	.button {
		display: inline-block;
		padding: 0.75rem 1.5rem;
		background: #2563eb;
		color: white;
		text-decoration: none;
		border-radius: 6px;
		font-weight: 500;
		transition: background 0.2s;
		border: none;
		cursor: pointer;
		font-size: 1rem;
	}

	.button:hover {
		background: #1d4ed8;
	}

	.button.secondary {
		background: #6b7280;
	}

	.button.secondary:hover {
		background: #4b5563;
	}

	.button.retry {
		background: #ef4444;
	}

	.button.retry:hover {
		background: #dc2626;
	}
</style>
