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
					logs: displayData?.logs || [],
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
    // const state = { block3Cond: 'AB', feedback: 'Votre score indique que vous êtes turbo mega raciste, en fait.', d: '0.45' }; // For testing
		
		if (state?.block3Cond && state?.feedback) {
			displayData = {
				block3Cond: state.block3Cond,
				feedback: state.feedback,
				d: state.d || '',
				logs: state.logs || []
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

<svelte:head>
	<title>Biais & Moi — Resultats</title>
</svelte:head>

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
			<div class="feedback-wrapper">
				<div class="feedback-section">
					<h2>Resultats</h2>
					<p class="feedback">{displayData.feedback}</p>
				</div>
			</div>

			<div class="info-wrapper">
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
				</div>

				<div class="reference-section">
					<h3>Référence initiale du projet TAI</h3>
					<p class="citation">Nosek, B. A., Smyth, F. L., Hansen, J. J., Devos, T., Lindner, N. M., Ratliff (Ranganath), K. A., Smith, C. T., Olson, K. R., Chugh, D., Greenwald, A. G., & Banaji, M. R. (2007). Pervasiveness and correlates of implicit attitudes and stereotypes. European Review of Social Psychology, 18, 36-88.</p>
				</div>

				<div class="actions">
					<a href="/iat" class="button">Refaire le test</a>
					<a href="/" class="button secondary">Retour à l'accueil</a>
				</div>
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
		width: 40px;
		height: 40px;
		border: 3px solid #f0f0f0;
		border-top: 3px solid #2c2c2c;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.loader-container p {
		font-size: 0.9375rem;
		font-weight: 400;
	}

	.error-container {
		max-width: 600px;
		margin: 2rem auto;
		padding: 2rem;
		text-align: center;
	}

	.error-message {
		background: white;
		border: 1px solid #fecaca;
		border-radius: 8px;
		padding: 2rem;
		margin-bottom: 1.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
	}

	.error-message h2 {
		color: #dc2626;
		margin-bottom: 1rem;
		font-size: 1.25rem;
	}

	.error-message p {
		color: #991b1b;
		font-size: 0.9375rem;
	}

	.results-container {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	.feedback-wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 50vh;
		max-width: 800px;
		margin: 0 auto;
		padding: 0 2rem;
		width: 100%;
	}

	.info-wrapper {
		max-width: 800px;
		margin: 0 auto;
		padding: 0 2rem 2rem 2rem;
		width: 100%;
	}

	h2 {
		font-size: 1.25rem;
		margin-bottom: 1rem;
		margin-top: 0;
		font-weight: 600;
		letter-spacing: -0.01em;
	}

	.description-section,
	.reference-section {
		background: white;
		padding: 1.75rem;
		border-radius: 8px;
		margin-bottom: 1rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02), 0 1px 2px rgba(0, 0, 0, 0.03);
	}

	.feedback-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		background: white;
		padding: 2.5rem;
		border-radius: 12px;
		width: 100%;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02), 0 1px 2px rgba(0, 0, 0, 0.03);
	}

	.description-section {
		border-left: 3px solid #fbbf24;
	}

	.description-section h2 {
		margin-top: 1.5rem;
	}

	.description-section h2:first-child {
		margin-top: 0;
	}

	.description-section p {
		margin-bottom: 1rem;
		line-height: 1.65;
		font-size: 0.9375rem;
	}

	.reference-section {
		border-left: 3px solid #60a5fa;
	}

	.reference-section h3 {
		font-size: 1.125rem;
		margin-bottom: 0.5rem;
		font-weight: 600;
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
		font-size: 0.9375rem;
	}

	.info-links a:hover {
		text-decoration: underline;
	}

	.info-links p {
		margin-bottom: 0.5rem;
		margin-top: 1rem;
	}

	.citation {
		font-style: italic;
		font-size: 0.875rem;
		margin: 0;
		line-height: 1.65;
	}

	.feedback {
		font-size: 1.125rem;
		line-height: 1.65;
		margin: 0;
		font-weight: 400;
	}

	.actions {
		display: flex;
		gap: 0.75rem;
		justify-content: center;
		margin-top: 2rem;
		flex-wrap: wrap;
	}

	.button {
		display: inline-block;
		padding: 0.75rem 1.5rem;
		background: #2c2c2c;
		color: white;
		text-decoration: none;
		border-radius: 8px;
		font-weight: 500;
		transition: all 0.2s ease;
		border: none;
		cursor: pointer;
		font-size: 0.9375rem;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
		font-family: inherit;
	}

	.button:hover {
		background: #1a1a1a;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		transform: translateY(-1px);
	}

	.button.secondary {
		background: #fafafa;
		color: #4a4a4a;
		border: 1px solid #e5e5e5;
	}

	.button.secondary:hover {
		background: #f0f0f0;
		border-color: #d0d0d0;
	}

	.button.retry {
		background: #dc2626;
	}

	.button.retry:hover {
		background: #b91c1c;
	}
</style>
