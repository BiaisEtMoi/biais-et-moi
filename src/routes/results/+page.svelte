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
	.score-section {
		background: #f5f5f5;
		padding: 1.5rem;
		border-radius: 8px;
		margin-bottom: 1.5rem;
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
