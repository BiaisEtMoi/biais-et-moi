<script lang="ts">
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import {
		SEXE_OPTIONS,
		AGE_RANGE,
		PROFESSION_OPTIONS,
		TYPE_POSTE_OPTIONS,
		SPECIALITES,
		STRUCTURE_OPTIONS,
		REGIONS,
		ORIGINE_ETHNIQUE_OPTIONS
	} from './field-values';
  import { getIdentityFromStorage, STORAGE_KEY } from './identity.storage';
		import { track } from '@vercel/analytics';

	// Initialize form data from localStorage if available
	const initialFormData = browser 
		? getIdentityFromStorage() ?? {
			sexe: '',
			age: '',
			profession: '',
			typePoste: '',
			specialite: '',
			structure: '',
			region: '',
			origineEthnique: '',
			valid: false
		}
		: {
			sexe: '',
			age: '',
			profession: '',
			typePoste: '',
			specialite: '',
			structure: '',
			region: '',
			origineEthnique: '',
			valid: false
		};

	let formData = $state(initialFormData);

	// Save to localStorage whenever formData changes
	$effect(() => {
		if (browser) {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
		}
	});

	function handleSubmit(e: Event) {
		e.preventDefault();

		formData.valid = true;
		track('identity_form_submitted');
		// Form data is already saved in localStorage via $effect
		goto('/iat');
	}

	function handleClear() {
		formData = {
			sexe: '',
			age: '',
			profession: '',
			typePoste: '',
			specialite: '',
			structure: '',
			region: '',
			origineEthnique: '',
			valid: false
		};
		if (browser) {
			localStorage.removeItem(STORAGE_KEY);
		}
		track('identity_form_cleared');
	}

	// Check if form is valid
	const isFormValid = $derived(() => {
		const baseFields = formData.sexe && formData.age && formData.profession && 
			formData.structure && formData.region && formData.origineEthnique;
		
		// If profession is médecin, also require typePoste and specialite
		if (formData.profession === 'medecin') {
			return baseFields && formData.typePoste && formData.specialite;
		}
		
		return baseFields;
	});
</script>

<svelte:head>
	<title>Biais & Moi — A propos de vous</title>
</svelte:head>

<main>
	<div class="container">
		<h1>Informations personnelles</h1>
		<p class="intro">
			Ces informations sont anonymes et serviront uniquement à analyser les résultats du test.
		</p>

		<form onsubmit={handleSubmit}>
			<!-- Sexe -->
			<div class="form-group">
				<label for="sexe">Sexe *</label>
				<select id="sexe" bind:value={formData.sexe} required>
					<option value="">Sélectionnez</option>
					{#each SEXE_OPTIONS as option}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			</div>

			<!-- Age -->
			<div class="form-group">
				<label for="age">Âge *</label>
				<select id="age" bind:value={formData.age} required>
					<option value="">Sélectionnez</option>
					{#each Array.from({ length: AGE_RANGE.max - AGE_RANGE.min + 1 }, (_, i) => i + AGE_RANGE.min) as age}
						<option value={age}>{age} ans</option>
					{/each}
				</select>
			</div>

			<!-- Profession -->
			<div class="form-group">
				<label for="profession">Profession *</label>
				<select id="profession" bind:value={formData.profession} required>
					<option value="">Sélectionnez</option>
					{#each PROFESSION_OPTIONS as option}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			</div>

			<!-- Type de poste (only if médecin) -->
			{#if formData.profession === 'medecin'}
				<div class="form-group">
					<label for="typePoste">Type de poste *</label>
					<select id="typePoste" bind:value={formData.typePoste} required>
						<option value="">Sélectionnez</option>
						{#each TYPE_POSTE_OPTIONS as option}
							<option value={option.value}>{option.label}</option>
						{/each}
					</select>
				</div>

				<!-- Spécialité (only if médecin) -->
				<div class="form-group">
					<label for="specialite">Spécialité *</label>
					<select id="specialite" bind:value={formData.specialite} required>
						<option value="">Sélectionnez</option>
						{#each SPECIALITES as specialite}
							<option value={specialite}>{specialite}</option>
						{/each}
					</select>
				</div>
			{/if}

			<!-- Structure -->
			<div class="form-group">
				<label for="structure">Structure dans laquelle vous travaillez *</label>
				<select id="structure" bind:value={formData.structure} required>
					<option value="">Sélectionnez</option>
					{#each STRUCTURE_OPTIONS as option}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			</div>

			<!-- Région -->
			<div class="form-group">
				<label for="region">Région dans laquelle vous travaillez *</label>
				<select id="region" bind:value={formData.region} required>
					<option value="">Sélectionnez</option>
					{#each REGIONS as region}
						<option value={region}>{region}</option>
					{/each}
				</select>
			</div>

			<!-- Origine ethnique -->
			<div class="form-group">
				<label for="origineEthnique">Comment vous identifiez vous *</label>
				<select id="origineEthnique" bind:value={formData.origineEthnique} required>
					<option value="">Sélectionnez</option>
					{#each ORIGINE_ETHNIQUE_OPTIONS as option}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			</div>

			<div class="button-container">
				<button type="button" class="clear-button" onclick={handleClear}>Effacer</button>
				<button type="submit" class="submit-button" disabled={!isFormValid()}>Faire le test</button>
			</div>
		</form>
	</div>
</main>

<style>
	main {
		display: flex;
		justify-content: center;
		padding: 2rem;
		min-height: 100vh;
	}

	.container {
		max-width: 600px;
		width: 100%;
		background: white;
		padding: 3rem;
		border-radius: 12px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02), 0 1px 2px rgba(0, 0, 0, 0.03);
		margin: 2rem 0;
	}

	h1 {
		font-size: 1.875rem;
		margin-bottom: 0.75rem;
		font-weight: 600;
		letter-spacing: -0.01em;
	}

	.intro {
		margin-bottom: 2rem;
		line-height: 1.65;
		font-size: 0.9375rem;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	label {
		font-weight: 500;
		font-size: 0.875rem;
		color: #1a1a1a;
	}

	select {
		padding: 0.625rem 0.75rem;
		border: 1px solid #e5e5e5;
		border-radius: 6px;
		font-size: 0.9375rem;
		background-color: white;
		cursor: pointer;
		transition: all 0.15s ease;
		font-family: inherit;
	}

	select:hover {
		border-color: #d0d0d0;
	}

	select:focus {
		outline: none;
		border-color: #2c2c2c;
		box-shadow: 0 0 0 3px rgba(44, 44, 44, 0.05);
	}

	.button-container {
		margin-top: 1.5rem;
		display: flex;
		gap: 0.75rem;
		justify-content: center;
	}

	.submit-button {
		padding: 0.75rem 2rem;
		background-color: #2c2c2c;
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 0.9375rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
		font-family: inherit;
	}

	.submit-button:hover:not(:disabled) {
		background-color: #1a1a1a;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		transform: translateY(-1px);
	}

	.submit-button:active:not(:disabled) {
		transform: translateY(0);
	}

	.submit-button:disabled {
		background-color: #e5e5e5;
		color: #9ca3af;
		cursor: not-allowed;
		box-shadow: none;
	}

	.clear-button {
		padding: 0.75rem 1.5rem;
		background-color: #fafafa;
		color: #4a4a4a;
		border: 1px solid #e5e5e5;
		border-radius: 8px;
		font-size: 0.9375rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		font-family: inherit;
	}

	.clear-button:hover {
		background-color: #f0f0f0;
		border-color: #d0d0d0;
	}

	.clear-button:active {
		transform: translateY(0);
	}
</style>
