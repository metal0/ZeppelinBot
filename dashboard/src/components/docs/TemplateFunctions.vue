<template>
  <div>
    <h1>Template Functions</h1>
    <p>
      This page details the different template functions available for tags and other plugins.
    </p>

    <h2 id="if">if > <code>if(condition, ifTrue, ifFalse)</code></h2>
    <p>
      Checks if a <code>condition</code> is true or false and returns the corresponding <code>ifTrue</code> or <code>ifFalse</code>.
    </p>
    <ul>
      <li><code>{if(user.bot, "User is a bot", "User is not a bot")}</code></li>
    </ul>





    <h2 id="number">number</h2>
    <p>
      Any number
    </p>

    <h2 id="user">user</h2>
    <p>
      Anything that uniquely identifies a user. This includes:
    </p>
    <ul>
      <li>User ID <code>108552944961454080</code></li>
      <li>User mention <code>@Dark#1010</code></li>
      <li>Loose user mention <code>Dark#1010</code></li>
    </ul>

    <h2 id="userId">userId</h2>
    <p>
      A valid user ID, e.g. <code>108552944961454080</code>
    </p>

    <h2 id="channel">channel</h2>
    <p>
      Anything that uniquely identifies a channel. This includes:
    </p>
    <ul>
      <li>Channel ID <code>473087035574321152</code></li>
      <li>Channel mention <code>#my-channel</code></li>
    </ul>

    <h2 id="channelId">channelId</h2>
    <p>
      A valid channel ID, e.g. <code>473087035574321152</code>
    </p>

    <h2 id="role">role</h2>
    <p>
      Anything that uniquely identifies a role. This includes:
    </p>
    <ul>
      <li>Role ID <code class="inline-code">473085927053590538</code></li>
      <li>Role mention <code>@MyRole</code></li>
    </ul>

    <h2 id="member">member</h2>
    <p>
      Anything that uniquely identifies a member currently on the server. This includes:
    </p>
    <ul>
      <li>User ID <code>108552944961454080</code></li>
      <li>User Mention <code>@Dark#1010</code></li>
      <li>Loose user mention <code>Dark#1010</code></li>
    </ul>

    <h2 id="resolvedMember">resolvedMember</h2>
    <p>
      See <code>member</code> above
    </p>

  </div>
</template>
