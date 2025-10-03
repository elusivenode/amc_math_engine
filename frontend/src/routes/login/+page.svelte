<svelte:head>
  <title>Sign in · AMC Math Engine</title>
  <meta name="description" content="Access the AMC Math Engine prototype." />
</svelte:head>

<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { get } from 'svelte/store';
  import { onMount } from 'svelte';
  import { apiFetch, type AuthResponse, type RegisterResponse } from '$lib/api';
  import { authStore, setAuth } from '$lib/stores/auth';

  type Mode = 'login' | 'register';
  type SignupPlan = 'MONTHLY' | 'LIFETIME';

  const planOptions: Array<{
    value: SignupPlan;
    label: string;
    price: string;
    description: string;
  }> = [
    {
      value: 'MONTHLY',
      label: 'Monthly access',
      price: '$15 per month',
      description: 'Recurring access billed every month.',
    },
    {
      value: 'LIFETIME',
      label: 'Lifetime access',
      price: '$100 one-time',
      description: 'Pay once for ongoing access.',
    },
  ];

  let mode: Mode = 'login';
  let email = '';
  let password = '';
  let displayName = '';
  let selectedPlan: SignupPlan = 'MONTHLY';
  let loading = false;
  let errorMessage = '';
  let checkoutStatus: string | null = null;

  onMount(() => {
    const current = get(authStore);
    if (current) {
      void goto('/dashboard');
    }
  });

  $: checkoutStatus = $page.url.searchParams.get('checkout');

  function switchMode(nextMode: Mode) {
    mode = nextMode;
    errorMessage = '';
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    errorMessage = '';
    loading = true;

    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      if (mode === 'login') {
        const response = await apiFetch<AuthResponse>(endpoint, {
          method: 'POST',
          body: { email, password },
        });

        setAuth(response);
        await goto('/dashboard');
        return;
      }

      const registerPayload = {
        email,
        password,
        displayName: displayName.trim() ? displayName.trim() : undefined,
        plan: selectedPlan,
      };

      const response = await apiFetch<RegisterResponse>(endpoint, {
        method: 'POST',
        body: registerPayload,
      });

      if (response.checkoutUrl) {
        window.location.assign(response.checkoutUrl);
        return;
      }

      throw new Error('Stripe checkout session could not be created.');
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : 'Authentication failed.';
    } finally {
      loading = false;
    }
  }
</script>

<div class="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-12">
  <header class="text-center">
    <p class="text-xs uppercase tracking-[0.3em] text-indigo-500">AMC Math Engine</p>
    <h1 class="mt-3 text-3xl font-semibold text-slate-900">
      {mode === 'login' ? 'Welcome back' : 'Create your account'}
    </h1>
    <p class="mt-2 text-sm text-slate-600">
      {mode === 'login'
        ? 'Sign in to continue your problem-solving journey.'
        : 'Register to unlock guided problem paths and track progress.'}
    </p>
  </header>

  <div class="mt-10 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
    <div class="flex gap-2 rounded-full bg-slate-100 p-1 text-sm font-medium">
      <button
        type="button"
        class="flex-1 rounded-full px-3 py-2 transition"
        class:selected={mode === 'login'}
        on:click={() => switchMode('login')}
      >
        Sign in
      </button>
      <button
        type="button"
        class="flex-1 rounded-full px-3 py-2 transition"
        class:selected={mode === 'register'}
        on:click={() => switchMode('register')}
      >
        Register
      </button>
    </div>

    {#if checkoutStatus === 'success'}
      <p class="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
        Payment confirmed! Sign in with your new credentials to start learning.
      </p>
    {:else if checkoutStatus === 'cancel'}
      <p class="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
        Checkout was cancelled. You can restart registration below when you're ready.
      </p>
    {/if}

    <form class="mt-8 space-y-5" on:submit={handleSubmit}>
      <label class="block text-sm font-medium text-slate-700">
        Email address
        <input
          class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-base text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          type="email"
          bind:value={email}
          placeholder="you@example.com"
          required
        />
      </label>

      <label class="block text-sm font-medium text-slate-700">
        Password
        <input
          class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-base text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          type="password"
          bind:value={password}
          placeholder="At least 8 characters"
          required
          minlength="8"
        />
      </label>

      {#if mode === 'register'}
        <div class="space-y-4">
          <label class="block text-sm font-medium text-slate-700">
            Display name
            <input
              class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-base text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              type="text"
              bind:value={displayName}
              placeholder="Optional"
              maxlength="50"
            />
          </label>

          <fieldset class="space-y-3">
            <legend class="text-sm font-medium text-slate-700">Choose your access plan</legend>
            {#each planOptions as option}
              <label
                class="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 px-4 py-3 transition hover:border-indigo-400"
                class:active={selectedPlan === option.value}
              >
                <input
                  class="mt-1"
                  type="radio"
                  name="plan"
                  value={option.value}
                  checked={selectedPlan === option.value}
                  on:change={() => (selectedPlan = option.value)}
                  required
                />
                <div>
                  <p class="font-semibold text-slate-900">{option.label}</p>
                  <p class="text-sm text-slate-600">{option.description}</p>
                  <p class="mt-1 text-sm font-medium text-indigo-600">{option.price}</p>
                </div>
              </label>
            {/each}
          </fieldset>
        </div>
      {/if}

      {#if errorMessage}
        <p class="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">
          {errorMessage}
        </p>
      {/if}

      <button
        class="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        disabled={loading}
      >
        {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
      </button>
    </form>
  </div>

  <p class="mt-6 text-center text-sm text-slate-500">
    Your credentials are stored securely with hashed passwords. Tokens are kept in your browser for this prototype.
  </p>
</div>

<style>
  button.selected {
    background: white;
    color: #312e81;
    box-shadow: 0 1px 3px rgb(15 23 42 / 0.1);
  }

  label.active {
    border-color: #4338ca;
    box-shadow: 0 1px 4px rgb(99 102 241 / 0.18);
  }
</style>
